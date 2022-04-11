from flask import Flask, Response, jsonify, request
import numpy as np
from MCMC import MetropolisHastings, MetropolisHastingsNoisy

app = Flask(__name__)

@app.route("/", methods=['POST'])
def metropolis():

    raw_input = request.json

    # List of variables and their defaults
    input = {'connections': None,
            'nodes': None,
            'infected': None,
            'is_noisy': False,
            'num_sample': 300,
            'lag': 3,
            'p': 0.13,
            'burn_in': 0.1,}
    
    # Required variables, will return Bad Request if any missing
    required_input = ['connections', 'nodes', 'infected']

    for key in input.keys():
        if key in raw_input.keys():
            input[key] = raw_input[key]
        elif key in required_input:
            return invalid_request("\"" + key + "\" is a required field")

    adj_matrix = conns_to_adj_matrix(input["nodes"], input["connections"])

    result = None

    if (input['is_noisy']):
        result = MetropolisHastingsNoisy(adj_matrix, input["infected"], input["p"], input["num_sample"], input["burn_in"])
    else:
        result = MetropolisHastings(adj_matrix, input["infected"], input["num_sample"], input["lag"], input["burn_in"])
    
    output = results_to_output(result[0])
    return jsonify(output)

def invalid_request(text):
    return Response(
        text,
        status=400,)

# Accepts a list of connections and returns an adjacency matrix
def conns_to_adj_matrix(nodes_list, connections_list):

    node_count = len(nodes_list)
    matrix = np.zeros((node_count, node_count))

    for connection in connections_list:
        node_a = connection[0]
        node_b = connection[1]

        matrix[node_a][node_b] = 1
        matrix[node_b][node_a] = 1

    return matrix

# Formats the MCMC function output to frontend input
def results_to_output(results):
    total = sum(results.values())
    output = []

    for sequence in results.keys():
        probability = results[sequence] / total
        output.append({"sequence":sequence, "probability":probability})
    
    return output


    
