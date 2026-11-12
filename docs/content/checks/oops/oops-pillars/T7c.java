public class T7c {
    interface Walker { default String move() { return "walk"; } }
    interface Swimmer { default String move() { return "swim"; } }
    static class Duck implements Walker, Swimmer {
        public String move() { return Walker.super.move() + " and " + Swimmer.super.move(); }
    }
    public static void main(String[] args) { System.out.println(new Duck().move()); }
}
