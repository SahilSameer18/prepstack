public class T6 {
    static void show(Object o) { System.out.println("Object"); }
    static void show(String s) { System.out.println("String"); }
    static void num(long x) { System.out.println("long"); }
    static void num(Integer x) { System.out.println("Integer"); }
    static class Animal { }
    static class Dog extends Animal { }
    static void greet(Animal a) { System.out.println("greet Animal"); }
    static void greet(Dog d) { System.out.println("greet Dog"); }
    public static void main(String[] args) {
        System.out.println("show(null):");        show(null);
        System.out.println("show(\"hi\"):");       show("hi");
        System.out.println("show((Object) \"hi\"):"); show((Object) "hi");
        System.out.println("num(5):");             num(5);
        System.out.println("num(Integer.valueOf(5)):"); num(Integer.valueOf(5));
        Animal a = new Dog();
        System.out.println("greet(a):");           greet(a);
        System.out.println("greet(new Dog()):");   greet(new Dog());
    }
}
