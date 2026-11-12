public class E7b {
    interface Walker { default String move() { return "walk"; } }
    interface Swimmer { default String move() { return "swim"; } }
    static class Duck implements Walker, Swimmer { }
}
