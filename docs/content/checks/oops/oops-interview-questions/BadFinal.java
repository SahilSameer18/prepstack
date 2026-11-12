public class BadFinal {
    int count;
    static int total() { return count; }
    public static void main(String[] args) {
        final int k = 1;
        k = 2;
    }
}
