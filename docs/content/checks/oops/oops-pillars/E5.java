public class E5 {
    static class Animal { String sound() { return "..."; } }
    static class Dog extends Animal {
        @Override String sond() { return "woof"; }
    }
}
