class Animal { }
class Dog extends Animal { void bark() { System.out.println("woof"); } }
class Cat extends Animal { }
public class T5 {
    public static void main(String[] args) {
        Animal a = new Dog();              // upcast: automatic
        Dog d = (Dog) a;                   // downcast: explicit
        d.bark();
        Animal c = new Cat();
        System.out.println(c instanceof Dog);
        Dog bad = (Dog) c;                 // throws
    }
}
