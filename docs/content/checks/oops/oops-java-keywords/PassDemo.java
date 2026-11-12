public class PassDemo {
    static class Box { int n; Box(int n) { this.n = n; } }
    static void reassign(Box b) { b = new Box(99); }
    static void mutate(Box b) { b.n = 99; }
    public static void main(String[] a) {
        Box box = new Box(1);
        reassign(box);
        System.out.println(box.n);
        mutate(box);
        System.out.println(box.n);
    }
}
