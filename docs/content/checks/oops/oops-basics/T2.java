public class T2 {
    static class Dog {
        String name;
        Dog(String name) { this.name = name; }
    }
    public static void main(String[] args) {
        Dog a = new Dog("Rex");
        Dog b = a;
        Dog c = new Dog("Rex");
        b.name = "Max";
        System.out.println(a.name);
        System.out.println(a == b);
        System.out.println(a == c);
        Dog d = null;
        System.out.println(d == null);
    }
}
