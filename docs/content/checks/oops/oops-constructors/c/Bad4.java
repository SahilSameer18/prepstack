class Util { private Util() { } static int twice(int n) { return 2 * n; } }
public class Bad4 { public static void main(String[] a) { new Util(); } }
