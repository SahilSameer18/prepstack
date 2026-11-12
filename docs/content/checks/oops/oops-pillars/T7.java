public class T7 {
    static class Animal { String eats() { return "food"; } }
    static class Dog extends Animal { String barks() { return "woof"; } }
    static class Puppy extends Dog { }     // multilevel
    static class Cat extends Animal { }    // hierarchical: Dog and Cat share Animal
    public static void main(String[] args) {
        Puppy p = new Puppy();
        System.out.println(p.eats() + " " + p.barks());
        System.out.println(new Cat().eats());
    }
}
