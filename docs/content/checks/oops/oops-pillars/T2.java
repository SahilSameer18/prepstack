public class T2 {
    static class Animal { String name = "Rex"; }
    static class Dog extends Animal { void bark() { System.out.println(name + " barks"); } }
    public static void main(String[] args) {
        Dog d = new Dog();
        d.bark();
        System.out.println(Animal.class.getSuperclass().getSimpleName());
        System.out.println(d instanceof Animal);
    }
}
