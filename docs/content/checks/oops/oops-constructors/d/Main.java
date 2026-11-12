class Base {
    Base() { System.out.println("Base sees: " + describe()); }
    String describe() { return "base"; }
}
class Child extends Base {
    private String label = "ready";
    Child() { System.out.println("Child sees: " + describe()); }
    @Override String describe() { return "label=" + label; }
}
public class Main {
    public static void main(String[] args) { new Child(); }
}
