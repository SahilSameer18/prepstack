public class T7 {
    static class Animal { String sound() { return "..."; } }
    static class Dog extends Animal {
        @Override String sound() { return super.sound() + " woof"; }
    }
    public static void main(String[] args) {
        System.out.println(new Dog().sound());
    }
}
