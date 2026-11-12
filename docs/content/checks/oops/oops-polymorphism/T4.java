public class T4 {
    static class Animal { static String kind() { return "animal"; } }
    static class Dog extends Animal { static String kind() { return "dog"; } }
    public static void main(String[] args) {
        Animal a = new Dog();
        System.out.println(a.kind());
        System.out.println(Dog.kind());
    }
}
