class Door implements AutoCloseable {
    final String name;
    Door(String name) { this.name = name; System.out.println("open " + name); }
    public void close() { System.out.println("close " + name); }
}
public class Main {
    public static void main(String[] args) {
        try (Door d = new Door("A")) { System.out.println("inside"); }
        System.out.println("-- two doors");
        try (Door d = new Door("A"); Door e = new Door("B")) {
            System.out.println("inside");
        }
        System.out.println("after");
    }
}
