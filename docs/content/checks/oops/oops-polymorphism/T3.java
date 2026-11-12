public class T3 {
    static class Animal {
        String type = "animal";
        String sound() { return "..."; }
    }
    static class Dog extends Animal {
        String type = "dog";
        @Override String sound() { return "woof"; }
    }
    public static void main(String[] args) {
        Animal a = new Dog();
        System.out.println(a.sound());
        System.out.println(a.type);
        System.out.println(((Dog) a).type);
    }
}
