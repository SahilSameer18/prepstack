public class F1 {
    static class Animal { final String breathe() { return "breathes"; } }
    static class Dog extends Animal { }
    public static void main(String[] args) {
        System.out.println(new Dog().breathe());
    }
}
