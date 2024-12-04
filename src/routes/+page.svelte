<script>
  import { onMount } from "svelte";

  onMount(async () => {
    const mainModule = await import("$lib/main.ts");
    console.log("VLADA 2");
    mainModule.main();
  });
</script>

<h1 class="text-3xl font-bold underline">Welcome to Basketball Legends</h1>
<p>A basketball career simulation game where you can build your legacy!!!!</p>
