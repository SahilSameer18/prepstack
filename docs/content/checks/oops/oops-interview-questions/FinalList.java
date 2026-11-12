import java.util.ArrayList;
import java.util.List;
public class FinalList {
    public static void main(String[] args) {
        final List<String> l = new ArrayList<>();
        l.add("still allowed");
        System.out.println(l);
    }
}
