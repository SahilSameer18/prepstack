interface Greeter {
    int MAX = 3;
    String name();
    default String greet() { return prefix() + name(); }
    private String prefix() { return "Hello, "; }
}
interface Logger { default String tag() { return "[log]"; } }
class Person implements Greeter, Logger {
    public String name() { return "Asha"; }
}
class Ravi implements Greeter {
    public String name() { return "Ravi"; }
}
public class Main {
    public static void main(String[] args) {
        System.out.println(new Person().greet() + " " + new Person().tag());
        System.out.println(new Ravi().greet());
        System.out.println(Greeter.MAX);
    }
}
