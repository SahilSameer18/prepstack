public class T5 {
    static class Animal { String sound() { return "..."; } }
    static class Dog extends Animal {
        @Override String sound() { return "woof"; }
    }
    public static void main(String[] args) {
        Animal a = new Dog();
        System.out.println(a.sound());
        System.out.println(new Animal().sound());
    }
}
