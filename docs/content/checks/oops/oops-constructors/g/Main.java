class Base {
    Base() { System.out.println("Base sees: " + describe()); }
    String describe() { return "base"; }
}
class Child extends Base {
    private final String label = "ready";   // final with a constant value
    @Override String describe() { return "label=" + label; }
}
public class Main {
    public static void main(String[] args) { new Child(); }
}
