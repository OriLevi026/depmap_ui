from flask import Flask, jsonify, request, send_file
from flask_cors import CORS

import subprocess
import os
import json
import tempfile
import time
import pandas as pd

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Command Execution Utility
def run_command(command):
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"Command failed: {result.stderr}")
    return result.stdout

# Routes

@app.route('/reset_action', methods=['POST'])
def reset_action():
    data = request.json
    action = data.get('action')
    label = data.get('label')
    try:
        run_command(f"depmap {action} reset -l {label} -a ")
        return jsonify({"success": True})
    except RuntimeError:
        return jsonify({"success": False})

@app.route('/get_existing_labels', methods=['GET'])
def get_existing_labels():
    try:
        output = run_command("depmap label list")
        labels = output.strip().split('\n')[1:]
        return jsonify([label.strip() for label in labels])
    except RuntimeError:
        return jsonify([])

@app.route('/delete_label', methods=['POST'])
def delete_label():
    data = request.json
    label = data.get('label')
    try:
        actions = run_command(f"depmap action list -n")
        actions = actions.split("Available actions:")[1].strip().splitlines()
        for action in actions:
            run_command(f"depmap analysis delete -l {label} -a {action}")
        run_command(f"depmap label delete {label}")
        return jsonify({"success": True})
    except RuntimeError:
        return jsonify({"success": False})

@app.route('/check_label/<label>', methods=['GET'])
def check_label(label):
    try:
        output = run_command("depmap label list -s")
        if label not in output:
            return jsonify({"status": None})
        lines = output.strip().splitlines()
        labels_status = {}
        for line in lines:
            if ':' in line:
                parts = line.split(':')
                label_name = parts[0].strip()
                label_status = parts[1].strip()
                labels_status[label_name] = label_status
        return jsonify({"status": labels_status.get(label, "False") == "True"})
    except RuntimeError:
        return jsonify({"status": False})

@app.route('/clone_repository', methods=['POST'])
def clone_repository():
    data = request.json
    input_type = data.get('input_type')
    input_value = data.get('input_value')
    label = data.get('label')
    
    try:
        if input_type == "GitHub Repo URL":
            command = f"depmap clone -u {input_value} -l {label}"
        else:
            with open("temp_file.txt", "w") as f:
                f.write(input_value)
            command = f"depmap clone -f temp_file.txt -l {label}"
        output = run_command(command)
        return jsonify({"output": output})
    except RuntimeError as e:
        return jsonify({"error": str(e)})

@app.route('/get_action_progress/<label>', methods=['GET'])
def get_action_status(label):
    try:
        output = run_command(f"depmap action status -l {label}")
        action_statuses = {}
        if "Progress for all actions:" in output:
            lines = output.split("Progress for all actions:")[1].strip().splitlines()
            for line in lines:
                if ":" in line:
                    action, progress_str = line.split(":")
                    action = action.strip()
                    progress_value = float(progress_str.strip())
                    if progress_value == 0.00:
                        color = "red"
                    elif 0.00 < progress_value < 1.00:
                        color = "green"
                    elif progress_value == 1.00:
                        color = "green"
                    else:
                        color = "orange"
                    action_statuses[action] = {"status": progress_value, "color": color}
            return jsonify(action_statuses)
        else:
            return jsonify({"error": "Progress information not found in the output"})
    except RuntimeError as e:
        return jsonify({"error": str(e)})

@app.route('/start_analysis', methods=['POST'])
def start_analysis():
    data = request.json
    label = data.get('label')
    action = data.get('action')
    command = f"depmap analysis start -l {label} -a {action}"
    try:
        process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        start_time = time.time()
        while True:
            if process.poll() is not None:
                output, error = process.communicate()
                break
            if time.time() - start_time > 3:
                process.terminate()
                return jsonify({"status": "started"})
            time.sleep(0.1)
        
        if "Analysis started" in output:
            status = "RUNNING" if "RUNNING" in output else "COMPLETED" if "COMPLETED" in output else "FAILED"
            return jsonify({"status": status})
        elif "404 Client Error" in output:
            return jsonify({"status": "failed"})
        else:
            return jsonify({"status": "Error", "output": output or error})
    except subprocess.SubprocessError as e:
        return jsonify({"status": "failed", "error": str(e)})

@app.route('/retrieve_analysis_results', methods=['POST'])
def retrieve_analysis_results():
    data = request.json
    output_list = data.get('output_list', [])
    try:
        combined_output = "".join(output_list)
        if "Analysis completed" in combined_output:
            analysis_json_str = combined_output.split("Analysis completed: ")[1].split("Analysis complete. Check status for details.")[0].strip()
            analysis_result = json.loads(analysis_json_str)
            dependencies = analysis_result["actions"]["multidep"]["details"][0]["analysis"]["dependencies"]
            df_dependencies = pd.DataFrame(dependencies)
            df_dependencies = df_dependencies[["name", "current", "latest", "notes", "potential_breaking_change", "deprecated"]]
            df_dependencies.columns = ["Name", "Current", "Latest", "Notes", "Potential Breaking Change", "Deprecated"]
            csv_file = tempfile.NamedTemporaryFile(delete=False, suffix='.csv')
            df_dependencies.to_csv(csv_file.name, index=False)
            return send_file(csv_file.name, mimetype='text/csv', as_attachment=True, download_name='dependencies.csv')
        else:
            return jsonify({"error": "Analysis did not complete successfully."})
    except (json.JSONDecodeError, KeyError) as e:
        return jsonify({"error": f"Failed to parse analysis results: {str(e)}"})

@app.route('/get_index/<selected_label>', methods=['GET'])
def get_index(selected_label):
    command = f"depmap analysis get -l {selected_label}"
    try:
        output = run_command(command)
        if not output.strip():
            return jsonify({"error": "No output received from the command. The command might have failed."})
        json_content = extract_json_from_output(output)
        data = json.loads(json_content)
        rows = []
        for action, items in data.items():
            for item in items:
                file = item.get('file')
                if not file:
                    continue
                dependencies = item.get('analysis', {}).get('dependencies', [])
                for dependency in dependencies:
                    row = {
                        "File": file,
                        "Name": dependency.get("name"),
                        "Current": dependency.get("current"),
                        "Latest": dependency.get("latest"),
                        "Potential Breaking Change": dependency.get("potential_breaking_change"),
                        "Deprecated": dependency.get("deprecated"),
                        "Notes": dependency.get("notes")
                    }
                    rows.append(row)
        if not rows:
            return jsonify({"error": "No dependency data found."})
        df = pd.DataFrame(rows, columns=["File", "Name", "Current", "Latest", "Potential Breaking Change", "Deprecated", "Notes"])
        csv_file = tempfile.NamedTemporaryFile(delete=False, suffix='.csv')
        df.to_csv(csv_file.name, index=False)
        return send_file(csv_file.name, mimetype='text/csv', as_attachment=True, download_name='index.csv')
    except Exception as e:
        return jsonify({"error": str(e)})

@app.route('/get_actions', methods=['GET'])
def get_actions():
    try:
        output = run_command("depmap action list -n")
        if "Available actions:" in output:
            # Split the actions and return them as a list (array in JSON)
            actions = output.split("Available actions:")[1].strip().splitlines()
            actions_list = [action.strip() for action in actions]
            print(actions_list)
            return jsonify(actions_list)  # Returning an array instead of a dictionary
        else:
            return jsonify({"error": "No actions found in the output"})
    except RuntimeError as e:
        return jsonify({"error": str(e)})

@app.route('/show_action/<action>', methods=['GET'])
def show_action(action):
    try:
        command = f"depmap action get {action}"
        output = run_command(command)
        try:
            data = json.loads(output)
            return jsonify(data)
        except json.JSONDecodeError:
            return jsonify({"output": output})
    except RuntimeError as e:
        return jsonify({"error": str(e)})

@app.route('/add_action', methods=['POST'])
def add_action():
    action_data = request.json
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".json") as tmp_file:
            json.dump(action_data, tmp_file, indent=4)
            tmp_file_path = tmp_file.name
        command = f"depmap action store -f {tmp_file_path}"
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode != 0:
            return jsonify({"error": f"Failed to store the action: {result.stderr}"})
        return jsonify({"success": "Action stored successfully."})
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"})

# Utility to extract JSON from command output
def extract_json_from_output(output):
    json_start = output.find('{')
    if json_start != -1:
        return output[json_start:]
    else:
        raise ValueError("No JSON content found in the output.")

if __name__ == '__main__':
    app.run(debug=True)
