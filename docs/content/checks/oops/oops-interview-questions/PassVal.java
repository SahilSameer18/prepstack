public class PassVal {
    static class Box { int n; Box(int n) { this.n = n; } }
    static void swap(Box a, Box b) { Box t = a; a = b; b = t; }
    static void bump(Box a) { a.n++; }
    static void reset(Box a) { a = new Box(99); }
    public static void main(String[] args) {
        Box x = new Box(1), y = new Box(2);
        swap(x, y);
        System.out.println(x.n + " " + y.n);
        bump(x);
        System.out.println(x.n);
        reset(x);
        System.out.println(x.n);
        Box c = x;          // copies the reference, not the object
        c.n = 50;
        System.out.println(x.n);
    }
}
