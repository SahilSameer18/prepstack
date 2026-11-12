public class Multi {
    interface Swims { default String move() { return "swim"; } }
    interface Flies { default String fly() { return "fly"; } }
    static class Duck implements Swims, Flies { }
    public static void main(String[] args) {
        Duck d = new Duck();
        System.out.println(d.move() + " " + d.fly());
    }
}
