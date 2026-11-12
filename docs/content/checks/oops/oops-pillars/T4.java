public class T4 {
    static class Animal {
        String name;
        Animal(String name) { this.name = name; }
        String describe() { return "animal " + name; }
    }
    static class Dog extends Animal {
        Dog(String name) { super(name); }
        String describe() { return "dog, and also " + super.describe(); }
    }
    public static void main(String[] args) {
        System.out.println(new Dog("Rex").describe());
    }
}
