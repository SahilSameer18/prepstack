public class Dispatch {
    static class Animal {
        String name = "animal-field";
        static String kind() { return "Animal.kind"; }
        String sound() { return "..."; }
    }
    static class Dog extends Animal {
        String name = "dog-field";
        static String kind() { return "Dog.kind"; }
        @Override String sound() { return "Woof"; }
    }
    static String show(Object o) { return "show(Object)"; }
    static String show(String s) { return "show(String)"; }

    public static void main(String[] args) {
        Animal a = new Dog();
        System.out.println(a.sound());          // overriding: run-time class
        System.out.println(a.name);             // field hiding: declared type
        System.out.println(((Animal) a).kind()); // static: declared type
        Object o = "hello";
        System.out.println(show(o));            // overloading: declared type
        System.out.println(show("hello"));
    }
}
