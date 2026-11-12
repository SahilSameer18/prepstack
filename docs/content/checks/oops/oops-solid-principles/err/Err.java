public class Err {
    interface Printer { void print(String d); }
    interface Scanner { String scan(); }
    static class SimplePrinter implements Printer { public void print(String d) { } }
    static String scanIt(Scanner s) { return s.scan(); }
    public static void main(String[] a) { scanIt(new SimplePrinter()); }
}
