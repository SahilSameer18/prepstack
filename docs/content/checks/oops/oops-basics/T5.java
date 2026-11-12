public class T5 {
    static class Counter {
        int count;
        Counter add(int count) {
            this.count += count;
            return this;
        }
    }
    public static void main(String[] args) {
        Counter c = new Counter();
        c.add(2).add(3);
        System.out.println(c.count);
    }
}
