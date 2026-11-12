public class C1 {
    static class Animal {
        String name;
        Animal(String name) { this.name = name; }
    }
    static class Dog extends Animal {
        Dog(String name) {
            if (name == null) throw new IllegalArgumentException("no name");
            super(name.trim());
        }
    }
    public static void main(String[] args) {
        System.out.println(new Dog(" Rex ").name);
    }
}
