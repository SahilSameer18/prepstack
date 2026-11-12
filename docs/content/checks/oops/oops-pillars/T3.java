public class T3 {
    static class Animal {
        private String secret;
        Animal(String s) { secret = s; }
        String getSecret() { return secret; }
    }
    static class Dog extends Animal {
        Dog() { super("bone"); }
        void show() { System.out.println(getSecret()); }
    }
    public static void main(String[] args) { new Dog().show(); }
}
