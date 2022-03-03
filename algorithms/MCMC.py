import numpy as np
import networkx as nx
import matplotlib.pyplot as plt
from scipy.stats import binom



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
    n0 = np.random.binomial(Ninf-1,1/Ninf) # choose starting node
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
    for n0 in range(Ninf):
        for n1 in range(n0+1, Ninf+1):
            subx = x[0:n0]
            subx_ = x_[0:n1]
            Gsim = np.array(G)
            for n in range(n1,Ninf):
                Gsim[:,seq[n]] = np.zeros(N)
            p += binom.pmf(n0,Ninf-1,1/Ninf) * (1/(Ninf-n0)) * likelihood_function(Gsim,subx_, n0)

    return p


def infectedSubgraph(G,seq):
    N = G.shape[0]
    for n in range(N):
        if n not in seq:
            G[:,n] = np.zeros(N)
            G[n,:] = np.zeros(N)
    return G


# given a set of infected nodes, create a valid starting sequence
def scramble(G, inf):
    subG = infectedSubgraph(np.array(G),inf)
    seq0 = simulate(subG, len(inf), [inf[np.random.randint(0,len(inf))]])
    return seq0


"""
Calculate the posterior probability of sequences using Metropolis-Hastings algorithm
Input:
    - G: background graph written as N*N adjacency matrix
    - inf: infected subgraph written as a list of node indices
    - num_sample: the number of Monte Carlo samples
    - (*) lag: the number of interleaving samples (default=3)
    - (*) burnin: the proportion of samples discarded (default=0.1)
Output: 
    - dictionary of sequence and its corresponding counts
"""
def MetropolisHastings(G, inf, num_sample, lag=3, burnin=0.1):
    count = {}
    burn = burnin*num_sample
    n = 0

    c = 1
    x = scramble(np.array(G),inf)
    while n < num_sample+burnin:
        y = randomWalk(np.array(G),x)
        r = (likelihood_function(G,y)/likelihood_function(G,x))*(transitionProb(y,x,G)/transitionProb(x,y,G))

        if np.random.rand() < r:
            n += 1
            x = y
            if n > burn:
                stry = ''.join(str(e) for e in y) # convert list into string (hashable)
                if stry not in count:
                    count[stry] = 1
                else:
                    count[stry] += 1
        if c % 1000 == 0:
            print('acceptance ratio:', n/c)
        c += 1
    return count


### testing area
N = 10
G = nx.to_numpy_array(nx.gnp_random_graph(N, 0.25, seed=666))
np.random.seed(666)
seq = simulate(np.array(G), 8, seq=[1])
print(seq)

# seq_ = randomWalk(np.array(G),seq)
# print(seq)

count = MetropolisHastings(np.array(G),seq,5000, burnin=0.5)
print(count)

# seq = [1, 10, 17, 14, 18, 19, 6, 13]
# seq_ = randomWalk(G, seq)
# print(seq_)