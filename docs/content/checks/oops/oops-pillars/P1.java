public class P1 {
    static class Animal { String sound() { return "..."; } }
    static class Dog extends Animal {
        private int age = 3;
        int getAge() { return age; }
        String sound() { return "woof"; }
    }
    public static void main(String[] args) {
        Animal a = new Dog();
        System.out.println(a.sound());
        System.out.println(((Dog) a).getAge());
    }
}
