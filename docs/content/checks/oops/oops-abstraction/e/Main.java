interface P { default int f() { return 1; } }
public class Main { public static void main(String[] a) { System.out.println(new P(){}.f()); } }
