class Counter {
    static int created = 0;
    int id;
    static { System.out.println("Counter loaded"); }
    Counter() { created++; id = created; }
    static String who() { return "Counter"; }
}
class Sub extends Counter {
    static String who() { return "Sub"; }
}
public class StaticDemo {
    public static void main(String[] a) {
        System.out.println("start");
        new Counter(); Counter c = new Counter();
        System.out.println(Counter.created + " " + c.id);
        Counter s = new Sub();
        System.out.println(s.who() + " " + Sub.who());
    }
}
