import time

import numpy as np
import networkx as nx
import matplotlib.pyplot as plt
from scipy.stats import binom, geom



"""
Simulate an infectious process
Input:
    - G: background graph written as N*N adjacency matrix
    - (*) seq: a starting sequence 
Output: 
    - seq: a sequence of infected nodes written as a list
"""
def simulate(G, lim, seq=None):
    N = G.shape[0] # get the population size

    # if starting sequence not specified, pick patient zero uniformly
    if seq == None:
        seq = [np.random.randint(0,N)]

    for t in range(lim-len(seq)):
        # find all candidates for infection
        candidate = {}
        for inf in seq:
            for n in range(N):
                if G[inf,n] == 1 and n not in seq:
                    tau = np.random.exponential(scale=1)
                    if n not in candidate:
                        candidate[n] = tau
                    else:
                        candidate[n] = min(candidate[n], tau)

        # take the first to get infected
        nextinf = min(candidate, key=candidate.get)
        seq.append(nextinf)

        # demonstration purposes, can delete
        # nxG = nx.from_numpy_matrix(G)
        # pos = nx.circular_layout(nxG)
        # color = []
        # for n in range(N):
        #     if n in seq:
        #         color.append('red')
        #     else:
        #         color.append('blue')
        # nx.draw(nxG, node_color=color, pos=pos, with_labels=True)
        # plt.show()
    
    return seq


def simulateWithObservation(G, obs, seq=None, p=0.3):
    N = G.shape[0]  # get the population size

    # if starting sequence not specified, pick patient zero uniformly
    if seq == None:
        init = np.random.randint(0, N)
        seq = [init]

    # check if observations match
    sympSet = set()
    [sympSet.add(s) for s in seq if s in obs]
    matchObs = (obs == sympSet)

    # extra asymptomatics
    extra = np.random.geometric(1-p) - 1

    # start simulation
    while (not matchObs or extra > 0) and len(seq) < N:
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

        # take the first to get infected
        nextinf = min(candidate, key=candidate.get)
        seq.append(nextinf)

        # check extra simulations steps
        if matchObs:
            extra -= 1

        # check if observation match
        if nextinf in obs:
            sympSet.add(nextinf)
            matchObs = (obs == sympSet)

        # # demonstration purposes, can delete
        # nxG = nx.from_numpy_matrix(G)
        # pos = nx.circular_layout(nxG)
        # color = []
        # for n in range(N):
        #     if n in seq and n in sympSet:
        #         color.append('red')
        #     elif n in seq and n not in sympSet:
        #         color.append('green')
        #     else:
        #         color.append('blue')
        # nx.draw(nxG, node_color=color, pos=pos, with_labels=True)
        # plt.show()

    return seq


"""
Calculates the likelihood function
Input: 
    - G: background graph written as N*N adjacency matrix
    - seq: a sequence of infected nodes written as a list of node indices
    - (*) prior: prior probabilities of nodes written as a list of size N (default=uniform)
Output: 
    - p: a number from 0 to 1
"""
def generateNominator(sequence, graph, boolean_arr):
    # Get the yet to be transvered node in the sequence
    next_node = sequence[np.count_nonzero(boolean_arr)]
    # Get all the node index that has been transvered, i.e True
    transvered_node_indices = [x for x in sequence if boolean_arr[sequence.index(x)] == True]
    # Start counting the possible edge
    count = 0
    # Iterate the transversed node
    for i in transvered_node_indices:
        # Count the number (0 or 1) at the graph index where transvered node meet the next tranvsered node
        #count = count + graph[i][sequence.index(next_node)]
        count = count + graph[i][next_node]
    return count

def generateDenominator(sequence, graph, boolean_arr):
    # Get the node in the sequence that will has its path counted
    curr_node = sequence[np.count_nonzero(boolean_arr) - 1]
    # Start counting the possible path
    count = 0
    # Get all the node index that has  been transvered, i.e True
    transvered_node_indices = [x for x in sequence if boolean_arr[sequence.index(x)] == True]
    # Iterate through the tranversed indices
    for i in transvered_node_indices:
        # Iterate through the row of the current node
        for j in range(len(graph)):
            # Dont include the already transvered node
            if j not in transvered_node_indices:
                count = count + graph[i][j]
    return count

def likelihood_function(graph, sequence,start=0):
    # Create boolean array like above
    #boolean_arr = np.array([False, False, False, False, False])
    boolean_arr = np.zeros(len(sequence), dtype=bool)
    for i in range(start):
        boolean_arr[i] = True
    # Initilize likelihood
    likelihood_prob = 1
    # Generate nominators and denomniators
    for i in range(start, len(sequence)-1):
        boolean_arr[i] = True
        nominator = generateNominator(sequence, graph, boolean_arr)
        denominator = generateDenominator(sequence, graph, boolean_arr)
        # Put together the formula
        likelihood_prob = likelihood_prob * nominator/denominator
    return likelihood_prob


"""
Given a sequence of infection, generate a new one in a Markov manner
Input:
    - G: background graph written as N*N adjacency matrix
    - seq: a sequence of infected nodes written as a list of node indices
Output:
    - seq_: a new sequence of infected nodes written as a list of node indices
"""
def randomWalk(G, seq):
    Ginf = infectedSubgraph(np.array(G), seq) # only consider the infected subgraph

    # print('original seq:', seq)

    N = Ginf.shape[0] # the population size
    Ninf = len(seq) # number of infected individual

    # start generating new string
    n0 = np.random.binomial(Ninf-1,np.log(Ninf)/Ninf) # choose starting node
    # print('starting',seq[0:n0])
    n1 = np.random.randint(low=n0, high=Ninf)+1 # choose the ending node
    # print('ending', seq[n1:Ninf])

    subseq = seq[0:n0] # the initial sequence kept
    if n0 == 0:
        subseq = [seq[np.random.randint(0,n1)]]

    # isolating nodes that are not changed
    Gsim = Ginf
    for n in range(n1,Ninf):
        Gsim[:,seq[n]] = np.zeros(N)
        # Gsim[seq[n],:] = np.zeros(N)

    # simulate on portion of infected subgraph
    seq_ = simulate(Gsim, n1, seq=subseq) + seq[n1:Ninf]
    return seq_


# transition probability from x to x_
def transitionProb(x,x_,G):
    Ninf = len(x)

    p = 0
    for n0 in range(0, Ninf):
        if x[0:n0] != x_[0:n0] and n0 != 0:
            break
        for n1 in range(n0+1, Ninf+1):
            subx_ = x_[0:n1]
            Gsim = np.array(G)
            for n in range(n1,Ninf):
                Gsim[:,x[n]] = np.zeros(G.shape[0])
            p += binom.pmf(n0,Ninf-1,1/Ninf) * (1/(Ninf-n0)) * likelihood_function(Gsim,subx_, n0)

    return p


def infectedSubgraph(G,seq):
    N = G.shape[0]
    for n in range(N):
        if n not in seq:
            G[:,n] = np.zeros(N)
            G[n,:] = np.zeros(N)
    return G


# Function to return the probabilty of an actual infection sequence, not the observed one
# Input is adjacency graph, observed sequence, actual infection sequence, and given probability p
# Return p^(number not observed, i.e asymptomatic) times (1-p)^(number observed, i.e symptomatic)
def asymptomatic_probability(graph, observed_seq, actualinfection_seq, p):
    number_not_observed = len(actualinfection_seq) - len(observed_seq)
    number_observed = len(observed_seq)
    probability = p**(number_not_observed) * (1-p)**(number_observed)
    return probability


def randomWalkNoisy(G, seq, obs):
    Ninf = len(seq)  # number of infected individual

    # start generating new string
    n0 = np.random.binomial(Ninf - 1, np.log(Ninf) / Ninf)  # choose starting node
    # print('starting',seq[0:n0])
    # print('ending', seq[n1:Ninf])

    subseq = seq[0:n0]  # the initial sequence kept
    if n0 == 0:
        subseq = [seq[np.random.randint(0, Ninf-1)]]

    # simulate on portion of infected subgraph
    seq_ = simulateWithObservation(G, obs, seq=subseq)
    return seq_


def transitionProbNoisy(x,x_,G, obs, q=0.3):
    Ninf = len(x)

    p = 0
    for n0 in range(0, Ninf):
        if x[0:n0] != x_[0:n0] and n0 != 0:
            break
        # calculate probability based on simulation likelihood and observation set
        obslength = Ninf
        tempObs = set()
        [tempObs.add(y) for y in obs]
        for i in range(len(x)):
            obslength -= 1
            if x[i] in tempObs: tempObs.remove(x[i])
            if len(tempObs) == 0: break
        p += binom.pmf(n0,Ninf-1, np.log(Ninf) / Ninf) * geom.pmf(obslength+1,(1-q)) * likelihood_function(G,x,n0)
    return p


# given a set of infected nodes, create a valid starting sequence
def scramble(G, inf):
    subG = infectedSubgraph(np.array(G),inf)
    seq0 = simulate(subG, len(inf), [inf[np.random.randint(0,len(inf))]])
    return seq0


def scrambleNoisy(G, obs):
    seq0 = simulateWithObservation(G, obs, [np.random.randint(0, G.shape[0])])
    return seq0


"""
Calculate the posterior probability of sequences using Metropolis-Hastings algorithm
Input:
    - G: background graph written as N*N adjacency matrix [nparray]
    - inf: infected subgraph written as a list of node indices [list]
    - num_sample: the number of Monte Carlo samples [int]
    - (*) burnin: the proportion of samples discarded (default=0.1) [float/double]
Output: 
    - dictionary of sequence and its corresponding counts
"""
def MetropolisHastings(G, inf, num_sample, burnin=0.1):
    count = {}
    burn = burnin*num_sample
    n = 0
    trans = []

    c = 1
    x = scramble(np.array(G),inf)
    while c < num_sample+burnin:
        y = randomWalk(np.array(G),x)
        r = (likelihood_function(G,y)/likelihood_function(G,x))*(transitionProb(x,y,G)/transitionProb(y,x,G))
        trans.append(r)

        if np.random.rand() < r:
            n += 1
            x = y
        if c > burn:
            stry = ''.join(str(e)+ ',' for e in x) # convert list into string (hashable)
            if stry not in count:
                count[stry] = 1
            else:
                count[stry] += 1
        if c % 100 == 0:
            print('acceptance ratio:', n/c)
        c += 1
    return count, trans


"""
Calculate the posterior probability of sequences using Metropolis-Hastings algorithm under noisy observation
Input:
    - G: background graph written as N*N adjacency matrix [nparray]
    - obs: infected subgraph written as a list of node indices [set]
    - p: the probability of an infection being asymptomatic [float/double]
    - num_sample: the number of Monte Carlo samples [int]
    - (*) burnin: the proportion of samples discarded (default=0.1) [float/double]
Output: 
    - dictionary of sequence and its corresponding counts
"""
def MetropolisHastingsNoisy(G, obs, p, num_sample, burnin=0.1):
    count = {}
    burn = burnin * num_sample
    n = 0
    trans = []

    c = 1
    x = scrambleNoisy(np.array(G), obs)
    while c < num_sample + burnin:
        y = randomWalkNoisy(np.array(G), x, obs)
        t1 = (likelihood_function(G, y)) / (likelihood_function(G, x))
        t2 = (asymptomatic_probability(G, obs, y, p) / asymptomatic_probability(G, obs, x, p))
        t3 = (transitionProbNoisy(x, y, np.array(G), obs, p) / transitionProbNoisy(y, x, np.array(G), obs, p))
        r = t1 * t2 * t3

        trans.append(r)

        if np.random.rand() < r:
            n += 1
            x = y
        if c > burn:
            stry = ''.join(str(e) + ',' for e in x)  # convert list into string (hashable)
            if stry not in count:
                count[stry] = 1
            else:
                count[stry] += 1
        if c % 100 == 0:
            print('acceptance ratio:', n / c, ' number of samples: ', n)
        c += 1
    return count, trans


# def plotHistogram(count, thres=10):
#     count_ = {}
#
#     i = 0
#     mincount = ['00000', 100000]
#     for k in count.keys():
#         if i < thres:
#             count_[k] = count[k]
#             i += 1
#             if count_[k] < mincount[1]:
#                 mincount = [k, count_[k]]
#         else:
#             if count[k] > mincount[1]:
#                 count_.pop(mincount[0])
#                 count_[k] = count[k]
#
#     plt.bar(count_.keys(), count_.values())
#     plt.xlabel('sampled sequence')
#     plt.ylabel('frequency')
#     plt.show()

### testing area
# N = 20
# G = nx.to_numpy_array(nx.gnp_random_graph(N, 0.25, seed=666),dtype=int)
# np.random.seed(666)
#
# p = 0.7
# seq = simulate(G, N//2)
# obs = set()
# [obs.add(x) for x in seq if np.random.rand() > p]
#
# print("original sequence: ",  seq)
# print("observed infections: ", obs)
#
# num_sam = 2000
# burnin = 0.15
# count, trans = MetropolisHastingsNoisy(np.array(G), obs, p, num_sam, burnin)
# # count, trans = MetropolisHastings(np.array(G),seq,num_sam, burnin=burnin)
# scount = {k: v for k, v in sorted(count.items(), key=lambda item: -1*item[1])}
# print(scount)

