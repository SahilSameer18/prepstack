class Base {
    Base() { System.out.println("Base sees: " + describe()); }
    String describe() { return "base"; }
}
class Child extends Base {
    private String label;
    Child() {
        label = "early";           // before super(...): allowed from Java 25
        super();
    }
    @Override String describe() { return "label=" + label; }
}
public class Main {
    public static void main(String[] args) { new Child(); }
}
