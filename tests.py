from difflib import SequenceMatcher

s1 = '''But what should I do?“.She felt goosebumps on her thighs.„Whatever you think it's appropriate.'''
s2 = '''He approached the machine and linked wires to his chest. Then he laid down. She was confused.„The trial will now begin.“„But what should I do?“.She felt goosebumps on her thighs.„Whatever you think it's appropriate.'''

commonwords = ['the','of','to','and','a','in','is','it','you','that','he','was','for','on','are','with','as','I','his','they','be','at','one','have','this','from','or','had','by','not','word','but','what','some','we','can','out','other','were','all','there','when','up','use','your','how','said','an','each','she','which','do','their','time','if','will','way','about','many','then','them','write','would','like','so','these','her','long','make','thing','see','him','two','has','look','more','day','could','go','come','did','number','sound','no','most','people','my','over','know','water','than','call','first','who','may','down','side','been','now','find']
st1 = set(s1.split())
st2 = set(s2.split())
c = set(commonwords)

print(SequenceMatcher(None,s1,s2).ratio())

st12 = st1 & st2
st12diff = st12.difference(c)
st1diff = st1.difference(c)
st2diff = st2.difference(c)

print(len(st1diff))
print(len(st2diff))
print(len(st12diff))