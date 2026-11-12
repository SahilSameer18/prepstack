interface Q { private int g() { return 2; } default int f() { return g(); } }
class Priv implements Q { }
