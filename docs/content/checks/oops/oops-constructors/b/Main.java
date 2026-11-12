class Animal {
    static { System.out.println("1 Animal static block"); }
    String kind = init("3 Animal field");   // init prints its text and returns it
    { System.out.println("4 Animal instance block"); }
    Animal() { System.out.println("5 Animal constructor"); }
    static String init(String s) { System.out.println(s); return s; }
}
class Dog extends Animal {
    static { System.out.println("2 Dog static block"); }
    String name = init("6 Dog field");
    { System.out.println("7 Dog instance block"); }
    Dog() { System.out.println("8 Dog constructor"); }
}
public class Main {
    public static void main(String[] args) {
        System.out.println("-- first Dog");
        new Dog();
        System.out.println("-- second Dog");
        new Dog();
    }
}
