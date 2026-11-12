public class T2 {
    static class Animal {
        Animal make() { return new Animal(); }
        public String name() { return "animal"; }
    }
    static class Dog extends Animal {
        @Override Dog make() { return new Dog(); }          // covariant return
        @Override public String name() { return "dog"; }
    }
    public static void main(String[] args) {
        Animal a = new Dog();
        System.out.println(a.make().getClass().getSimpleName());
        System.out.println(a.name());
    }
}
