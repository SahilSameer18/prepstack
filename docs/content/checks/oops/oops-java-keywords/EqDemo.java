import java.util.*;
public class EqDemo {
    static class P {
        int x;
        P(int x) { this.x = x; }
        @Override public boolean equals(Object o) { return o instanceof P p && p.x == x; }
    }
    static class Q extends P {
        Q(int x) { super(x); }
        @Override public int hashCode() { return x; }
    }
    public static void main(String[] a) {
        System.out.println(new P(1).equals(new P(1)));
        Set<P> s = new HashSet<>();
        s.add(new P(1));
        System.out.println(s.contains(new P(1)));
        Set<Q> t = new HashSet<>();
        t.add(new Q(1));
        System.out.println(t.contains(new Q(1)));
        String s1 = new String("hi"), s2 = new String("hi");
        System.out.println((s1 == s2) + " " + s1.equals(s2));
    }
}
