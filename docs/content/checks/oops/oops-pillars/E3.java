public class E3 {
    static class Animal { private String secret = "bone"; }
    static class Dog extends Animal {
        void show() { System.out.println(secret); }
    }
}
