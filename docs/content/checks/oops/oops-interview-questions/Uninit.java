public class Uninit {
    static class Dog { }
    static Dog field;
    public static void main(String[] args) {
        System.out.println(field);
        Dog local;
        System.out.println(local);
    }
}
