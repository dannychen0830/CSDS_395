import time
import numpy as np
import networkx as nx
import matplotlib.pyplot as plt
from scipy.stats import binom, geom
from scipy.sparse.csgraph import dijkstra

def simulate(G, lim, seq=None):
    N = G.shape[0]
    # get the population size
    # if starting sequence not specified, pick patient zero uniformly
    if seq == None:
        seq = [np.random.randint(0, N)]
    for t in range(lim - len(seq)):
        # find all candidates for infection
        candidate = {}
        for inf in seq:
            for n in range(N):
                if G[inf, n] == 1 and n not in seq:
                    tau = np.random.exponential(scale=1)
                    if n not in candidate:
                        candidate[n] = tau
                    else:
                        candidate[n] = min(candidate[n], tau)

        nextinf = min(candidate, key=candidate.get)
        seq.append(nextinf)
    return seq

def createSimulation():
    N = 10
    G = nx.to_numpy_array(nx.gnp_random_graph(N, 0.25, seed=666), dtype=int)
    infected = simulate(G, N // 2)
    obs = set()
    obs.add(infected[0])
    obs.add(infected[1])
    [obs.add(x)
    for x in infected if np.random.rand() > .3]
    x = dijkstra(G, directed=False, unweighted=True)
    print(x)
    for i in range(N):
        if i not in infected:
            x[i, :] = 0
            x[:, i] = 0
    largest = np.amax(x)
    index = np.where(x == largest)
    return (largest,index, obs,infected)

def PossiblePathsShort(sizeGraph, index, start, end,obs):
    pathArray;
    rows, columns = array.shape
    while(start != end):
        for x in obs:
            if (obs == start):
                obs.pop(start)
        for i in rows:
            if i not in obs:
                x[i, :] = 0
                x[:, i] = 0
            largest = np.amax(x)
            pathArray.add(largest)

    return 0

def PossiblePathsExpanded(sizeGraph, index, start, end,obs):
    return 0

print(createSimulation())


