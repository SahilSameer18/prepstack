import java.util.*;
final class Money {
    private final int cents;
    private final List<String> notes;
    Money(int cents, List<String> notes) { this.cents = cents; this.notes = List.copyOf(notes); }
    int cents() { return cents; }
    List<String> notes() { return notes; }
}
record Point(int x, int y) {
    Point { if (x < 0) throw new IllegalArgumentException("x < 0"); }
}
enum Level {
    LOW(1), HIGH(10);
    private final int weight;
    Level(int w) { weight = w; }
    int weight() { return weight; }
}
public class Shapes {
    public static void main(String[] a) {
        List<String> src = new ArrayList<>(List.of("a"));
        Money m = new Money(500, src);
        src.add("b");
        System.out.println(m.notes());
        Point p = new Point(1, 2);
        System.out.println(p + " " + p.x() + " " + p.equals(new Point(1, 2)) + " " + (p.hashCode() == new Point(1, 2).hashCode()));
        Level l = Level.HIGH;
        switch (l) { case LOW -> System.out.println("low"); case HIGH -> System.out.println("high " + l.weight()); }
        System.out.println(Level.valueOf("LOW").weight() + " " + Arrays.toString(Level.values()));
    }
}
