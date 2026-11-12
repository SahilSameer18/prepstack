import java.util.HashSet;
import java.util.Set;

public class Eq {
    static class P {
        final int x;
        P(int x) { this.x = x; }
        @Override public boolean equals(Object o) { return o instanceof P p && p.x == x; }
    }
    static class Q extends P {
        Q(int x) { super(x); }
        @Override public int hashCode() { return x; }
    }
    public static void main(String[] args) {
        String a = new String("java"), b = new String("java");
        System.out.println(a == b);
        System.out.println(a.equals(b));
        Set<P> set = new HashSet<>();
        set.add(new P(1));
        System.out.println(new P(1).equals(new P(1)));
        System.out.println(set.contains(new P(1)));   // equals without hashCode
        Set<Q> fixed = new HashSet<>();
        fixed.add(new Q(1));
        System.out.println(fixed.contains(new Q(1))); // with hashCode
    }
}
