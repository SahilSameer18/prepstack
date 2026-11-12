public class T1 {
    static class Dog {
        String name;
        int age;
        void bark() { System.out.println(name + " says woof"); }
    }
    public static void main(String[] args) {
        Dog a = new Dog();
        a.name = "Rex";
        a.age = 3;
        Dog b = new Dog();
        b.name = "Milo";
        a.bark();
        b.bark();
        System.out.println(a.age + " " + b.age);
    }
}
