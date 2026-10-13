import { Subject, Topic, Question, Student, PendingQuestionApproval, Attempt } from '../types';

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'dsa',
    code: 'CS301',
    name: 'Data Structures & Algorithms',
    semester: 3,
    department: 'Computer Science & Engineering',
    description: 'Foundations of memory representation, linked linear structures, hierarchical trees, graphs, and algorithmic complexity.',
    iconName: 'Network',
    totalHours: 48
  },
  {
    id: 'dbms',
    code: 'CS304',
    name: 'Database Management Systems',
    semester: 3,
    department: 'Computer Science & Engineering',
    description: 'Relational data modeling, relational algebra, SQL queries, functional dependencies, schema decomposition, and transaction ACID properties.',
    iconName: 'Database',
    totalHours: 42
  },
  {
    id: 'java',
    code: 'CS202',
    name: 'Java Programming & OOP',
    semester: 2,
    department: 'Computer Science & Engineering',
    description: 'Object-oriented programming paradigm, memory heap allocations, inheritance hierarchies, runtime polymorphism, and robust exception handling.',
    iconName: 'Code',
    totalHours: 40
  }
];

export const INITIAL_TOPICS: Topic[] = [
  // --- DSA TOPICS ---
  {
    id: 'dsa-pointers',
    subjectId: 'dsa',
    name: 'Pointers & Memory Allocation',
    code: 'DSA-01',
    depth: 0,
    prerequisites: [],
    summary: 'A pointer stores the memory address of another variable. Dynamic memory allocation via malloc/calloc in C/C++ or references in memory models allocates blocks on the heap. Dereferencing (*p) accesses the stored value, while (&x) evaluates the address.',
    workedExample: {
      title: 'Swapping Two Values Using Pointers',
      problem: 'Write a function to swap two integers without returning a tuple or using global memory.',
      code: `void swap(int *a, int *b) {
    int temp = *a; // Read value stored at address a
    *a = *b;       // Write value of b into memory location a
    *b = temp;     // Write stored temp into memory location b
}
int x = 10, y = 20;
swap(&x, &y); // Passes memory addresses of x and y`,
      walkthrough: 'Passing &x passes the actual memory location. If we passed simply (x, y), C creates local stack copies and original variables remain unchanged. Misunderstanding * vs & causes silent logic bugs.'
    },
    videoResource: {
      title: 'Pointers in C/C++ Demystified - CS50 Core',
      channel: 'Harvard CS50',
      duration: '18 mins',
      url: 'https://www.youtube.com/watch?v=2ybLDQzerE8'
    },
    bilingualNotes: {
      language: 'Hindi',
      summary: 'पॉइंटर (Pointer) एक ऐसा वेरिएबल है जो किसी दूसरे वेरिएबल का मेमोरी एड्रेस स्टोर करता है। *p का मतलब है उस एड्रेस पर रखी वैल्यू, और &x का मतलब है x का मेमोरी एड्रेस।',
      keyConceptTakeaway: 'याद रखें: *p (Dereference) = वैल्यू पढ़ना या बदलना; &x (Address-of) = मेमोरी का पता देना।'
    },
    misconceptions: [
      {
        id: 'misc-ptr-1',
        tag: 'DEREF_VS_ADDRESS_CONFUSION',
        description: 'Confusing *p (dereferencing value) with &p (address of the pointer itself).',
        remedialAdvice: 'Visualize memory addresses as house numbers and values as the residents. *p visits the resident; &x gets the house number.',
        remedialExample: 'int x = 5; int *p = &x; -> Here *p gives 5, while p gives the address of x (e.g., 0x7ffd).'
      },
      {
        id: 'misc-ptr-2',
        tag: 'DANGLING_POINTER_DELETION',
        description: 'Assuming freeing memory automatically sets the pointer to NULL.',
        remedialAdvice: 'free(p) releases the heap block back to the OS, but pointer p still points to the old address (dangling pointer) until you explicitly write p = NULL.',
        remedialExample: 'free(node); node = NULL; // Crucial defensive habit'
      }
    ]
  },
  {
    id: 'dsa-linked-lists',
    subjectId: 'dsa',
    name: 'Singly & Doubly Linked Lists',
    code: 'DSA-02',
    depth: 1,
    prerequisites: ['dsa-pointers'],
    summary: 'A linear data structure of nodes where each node contains data and a pointer to the next node. Unlike contiguous arrays, linked lists allow O(1) insertions at known nodes, but require O(n) sequential traversal.',
    workedExample: {
      title: 'Inserting a Node at Head of Singly Linked List',
      problem: 'Insert new node with value 42 at the front of list without losing existing chain.',
      code: `struct Node* insertAtHead(struct Node* head, int val) {
    struct Node* newNode = (struct Node*)malloc(sizeof(struct Node));
    newNode->data = val;
    newNode->next = head; // Point new node to old head first!
    head = newNode;       // Advance head to point to new node
    return head;
}`,
      walkthrough: 'Order of pointer assignment is critical. If you set head = newNode first before newNode->next = head, you overwrite the reference to the entire rest of the list, permanently leaking memory!'
    },
    videoResource: {
      title: 'Linked List Traversal and Insertion Patterns',
      channel: 'MIT OpenCourseWare',
      duration: '22 mins',
      url: 'https://www.youtube.com/watch?v=F8xQ40u2QY8'
    },
    bilingualNotes: {
      language: 'Hindi',
      summary: 'लिंक्ड लिस्ट (Linked List) नोड्स की एक चेन है। हर नोड में डेटा और अगले नोड का पॉइंटर होता है। नया नोड जोड़ते समय पॉइंटर का सही क्रम रखना सबसे महत्वपूर्ण है।',
      keyConceptTakeaway: 'पुराने हेड का एड्रेस खोने से पहले नए नोड के next को पुराने हेड से जोड़ें।'
    },
    misconceptions: [
      {
        id: 'misc-ll-1',
        tag: 'ORPHANING_REST_OF_LIST',
        description: 'Reassigning head pointer before wiring newNode->next, severing remaining list chain.',
        remedialAdvice: 'Always connect the new node to the downstream chain BEFORE redirecting upstream pointers.',
        remedialExample: 'newNode->next = head; THEN head = newNode;'
      },
      {
        id: 'misc-ll-2',
        tag: 'NULL_POINTER_DEREFERENCE_TRAVERSAL',
        description: 'Checking curr->next->data before verifying if curr->next is not NULL, causing segmentation fault.',
        remedialAdvice: 'Always guard pointer traversals with while (curr != NULL && curr->next != NULL).'
      }
    ]
  },
  {
    id: 'dsa-stacks-queues',
    subjectId: 'dsa',
    name: 'Stacks & Queues',
    code: 'DSA-03',
    depth: 2,
    prerequisites: ['dsa-linked-lists'],
    summary: 'Stack is LIFO (Last-In-First-Out) supporting push, pop, and peek in O(1). Queue is FIFO (First-In-First-Out) supporting enqueue and dequeue in O(1). Essential for recursion unwinding and buffer scheduling.',
    workedExample: {
      title: 'Valid Parentheses String Matching Using a Stack',
      problem: 'Determine if brackets like {[()]} are properly matched and balanced.',
      code: `bool isValid(string s) {
    stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '{' || c == '[') st.push(c);
        else {
            if (st.empty()) return false;
            char top = st.top(); st.pop();
            if ((c == ')' && top != '(') || (c == '}' && top != '{') || (c == ']' && top != '[')) return false;
        }
    }
    return st.empty(); // Stack must be completely empty at the end
}`,
      walkthrough: 'Closing brackets match the most recently seen opening bracket (LIFO). If stack is empty when closing bracket appears, or non-empty at end, the string is invalid.'
    },
    videoResource: {
      title: 'Stacks and Queues in Practice',
      channel: 'Stanford Engineering Everywhere',
      duration: '25 mins',
      url: 'https://www.youtube.com/watch?v=wjI1WNc4gbo'
    },
    bilingualNotes: {
      language: 'Hindi',
      summary: 'स्टैक (Stack) LIFO (लास्ट-इन-फर्स्ट-आउट) सिद्धांत पर काम करता है जैसे प्लेटों का ढेर। क्यू (Queue) FIFO (फर्स्ट-इन-फर्स्ट-आउट) पर काम करता है जैसे टिकट की लाइन।',
      keyConceptTakeaway: 'स्टैक = सबसे आखिरी में आया हुआ पहले निकलेगा; क्यू = जो पहले आया वो पहले निकलेगा।'
    },
    misconceptions: [
      {
        id: 'misc-sq-1',
        tag: 'STACK_UNDERFLOW_BLIND_POP',
        description: 'Calling pop() or top() without verifying if stack is non-empty first.',
        remedialAdvice: 'Always inspect !st.empty() before attempting to retrieve or discard elements.'
      }
    ]
  },
  {
    id: 'dsa-binary-trees',
    subjectId: 'dsa',
    name: 'Binary Trees & BST',
    code: 'DSA-04',
    depth: 2,
    prerequisites: ['dsa-linked-lists'],
    summary: 'Hierarchical tree structure where each node has at most two children (left and right). In a Binary Search Tree (BST), all left subtree nodes have keys < root key, and all right subtree nodes have keys > root key.',
    workedExample: {
      title: 'Recursive Search in a Binary Search Tree',
      problem: 'Find node with key target in BST. Return node pointer or NULL.',
      code: `Node* searchBST(Node* root, int target) {
    if (root == NULL || root->val == target) return root;
    if (target < root->val)
        return searchBST(root->left, target); // Prune right half
    return searchBST(root->right, target);    // Prune left half
}`,
      walkthrough: 'BST property allows binary pruning in O(h) time where h is tree height. If height is balanced, search takes O(log n).'
    },
    videoResource: {
      title: 'Binary Trees & Binary Search Trees Full Guide',
      channel: 'freeCodeCamp',
      duration: '35 mins',
      url: 'https://www.youtube.com/watch?v=fAAZixBzIAI'
    },
    bilingualNotes: {
      language: 'Hindi',
      summary: 'बाइनरी ट्री (Binary Tree) में हर नोड के अधिकतम 2 बच्चे (left, right) होते हैं। BST में बाएं तरफ हमेशा छोटे मान और दाएं तरफ बड़े मान होते हैं।',
      keyConceptTakeaway: 'ट्री के बेस के रूप में पॉइंटर्स का ज्ञान होना अनिवार्य है, क्योंकि हर नोड पॉइंटर्स से ही जुड़ा होता है।'
    },
    misconceptions: [
      {
        id: 'misc-tree-1',
        tag: 'ASSUMING_LOCAL_BST_SATISFIES_GLOBAL',
        description: 'Checking only left->val < root->val and right->val > root->val without checking ancestor bounds.',
        remedialAdvice: 'Every node in the ENTIRE left subtree must be less than root, not just the immediate left child. Use min/max range boundaries during validation.',
        remedialExample: 'A tree with root=10, right=15, and right->left=6 is NOT a BST because 6 < 10!'
      },
      {
        id: 'misc-tree-2',
        tag: 'CONFUSING_BINARY_TREE_WITH_BST',
        description: 'Assuming arbitrary binary trees maintain sorted properties and trying binary search on unsorted trees.',
        remedialAdvice: 'Regular binary trees have no ordering guarantee. You must perform full O(n) traversal unless explicitly defined as a BST.'
      }
    ]
  },
  {
    id: 'dsa-tree-traversals',
    subjectId: 'dsa',
    name: 'Tree Traversals (DFS & BFS)',
    code: 'DSA-05',
    depth: 3,
    prerequisites: ['dsa-binary-trees'],
    summary: 'Systematic visitation of every node in tree. Depth-First includes Inorder (L-Root-R, yields sorted output in BST), Preorder (Root-L-R, cloning trees), Postorder (L-R-Root, deletion/expression evaluation). Breadth-First (Level-Order) uses a FIFO queue.',
    workedExample: {
      title: 'Inorder Traversal of BST',
      problem: 'Print all keys of BST in strictly ascending order.',
      code: `void inorder(Node* root) {
    if (root == NULL) return; // Base case
    inorder(root->left);      // 1. Visit left subtree
    cout << root->val << " "; // 2. Visit current root node
    inorder(root->right);     // 3. Visit right subtree
}`,
      walkthrough: 'Because left children contain smaller elements and right children contain larger elements, Inorder traversal naturally prints keys in non-decreasing order.'
    },
    videoResource: {
      title: 'Tree Traversals: Inorder, Preorder, Postorder & Level Order',
      channel: 'GeeksforGeeks',
      duration: '19 mins',
      url: 'https://www.youtube.com/watch?v=gm8DUJJhmY4'
    },
    bilingualNotes: {
      language: 'Hindi',
      summary: 'ट्री ट्रैवर्सल (Tree Traversal): इनऑर्डर (Left, Root, Right) BST को सॉर्टेड क्रम में प्रिंट करता है। प्रीऑर्डर (Root, Left, Right) ट्री कॉपी करने के लिए उपयुक्त है।',
      keyConceptTakeaway: 'इनऑर्डर = Left -> Root -> Right। पोस्टऑर्डर = Left -> Right -> Root।'
    },
    misconceptions: [
      {
        id: 'misc-trav-1',
        tag: 'CONFUSING_TRAVERSAL_ORDER',
        description: 'Confusing Preorder (Root first) with Inorder (Root between subtrees).',
        remedialAdvice: 'Pre means root comes BEFORE children. In means root is IN-BETWEEN children. Post means root comes AFTER children.'
      }
    ]
  },
  {
    id: 'dsa-graphs',
    subjectId: 'dsa',
    name: 'Graph Representations',
    code: 'DSA-06',
    depth: 3,
    prerequisites: ['dsa-binary-trees', 'dsa-linked-lists'],
    summary: 'A set of vertices V and edges E connecting pairs of vertices. Represented either via Adjacency Matrix (V x V space, O(1) edge check) or Adjacency List (V + E space, optimal for sparse networks).',
    workedExample: {
      title: 'Constructing an Adjacency List for Undirected Graph',
      problem: 'Add an undirected edge between node u and node v.',
      code: `void addEdge(vector<vector<int>> &adj, int u, int v) {
    adj[u].push_back(v); // u connects to v
    adj[v].push_back(u); // Since undirected, v also connects to u!
}`,
      walkthrough: 'In an undirected graph, an edge connects both directions. Forgetting adj[v].push_back(u) treats the graph as directed, breaking symmetric pathfinding.'
    },
    videoResource: {
      title: 'Graph Theory Introduction and Representations',
      channel: 'WilliamFiset',
      duration: '28 mins',
      url: 'https://www.youtube.com/watch?v=09_LlHjoEiY'
    },
    bilingualNotes: {
      language: 'Hindi',
      summary: 'ग्राफ (Graph) वर्टिसेस (V) और किनारों (E) का समूह है। एडजेसेंसी लिस्ट (Adjacency List) कम मेमोरी लेती है और व्यावहारिक रूप से सबसे ज्यादा इस्तेमाल होती है।',
      keyConceptTakeaway: 'अनडायरेक्टेड ग्राफ में हमेशा दोनों दिशाओं में एज जोड़ें।'
    },
    misconceptions: [
      {
        id: 'misc-graph-1',
        tag: 'DIRECTED_VS_UNDIRECTED_ASYMMETRY',
        description: 'Forgetting to insert backward edge when building an undirected graph.',
        remedialAdvice: 'Undirected edges must always be registered symmetrically in both vertices adjacency lists.'
      }
    ]
  },
  {
    id: 'dsa-graph-traversals',
    subjectId: 'dsa',
    name: 'Graph Traversals (BFS & DFS)',
    code: 'DSA-07',
    depth: 4,
    prerequisites: ['dsa-graphs', 'dsa-stacks-queues'],
    summary: 'Breadth-First Search (BFS) explores neighbor-by-neighbor using a queue to find shortest path in unweighted graphs. Depth-First Search (DFS) explores as deep as possible using recursion/stack. A boolean visited[] array is mandatory to prevent infinite cycles.',
    workedExample: {
      title: 'Breadth-First Search with Visited Tracking',
      problem: 'Traverse all nodes reachable from source vertex s in undirected graph.',
      code: `void bfs(int s, vector<vector<int>> &adj, int n) {
    vector<bool> visited(n, false);
    queue<int> q;
    visited[s] = true;
    q.push(s);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) {
            if (!visited[v]) {
                visited[v] = true; // Mark visited IMMEDIATELY on push!
                q.push(v);
            }
        }
    }
}`,
      walkthrough: 'Marking visited[v] = true as soon as node is queued avoids enqueueing the same vertex multiple times from neighboring paths, preventing queue bloat and infinite loops.'
    },
    videoResource: {
      title: 'BFS and DFS Traversal Algorithms with Visualizations',
      channel: 'NeetCode',
      duration: '26 mins',
      url: 'https://www.youtube.com/watch?v=pcKY4hjDrxk'
    },
    bilingualNotes: {
      language: 'Hindi',
      summary: 'BFS कतार (Queue) का उपयोग करके सबसे छोटा रास्ता खोजता है। DFS गहराई में जाने के लिए स्टैक या रिकर्शन का उपयोग करता है। visited ऐरे लगाना अनिवार्य है।',
      keyConceptTakeaway: 'अगर visited ऐरे नहीं लगाएंगे तो साइकल वाले ग्राफ में कोड कभी खत्म नहीं होगा।'
    },
    misconceptions: [
      {
        id: 'misc-gtrav-1',
        tag: 'OMITTING_VISITED_ARRAY',
        description: 'Traversing cyclic graphs without tracking visited nodes, creating infinite loops.',
        remedialAdvice: 'Unlike trees which are naturally acyclic, graphs frequently contain loops. Always maintain a visited set or boolean array.'
      }
    ]
  },
  {
    id: 'dsa-sorting',
    subjectId: 'dsa',
    name: 'Advanced Sorting (Merge & Quick Sort)',
    code: 'DSA-08',
    depth: 2,
    prerequisites: ['dsa-pointers', 'dsa-linked-lists'],
    summary: 'Divide-and-conquer sorting algorithms. Merge Sort splits array in half, recursively sorts, and merges in O(n log n) guaranteed time with O(n) auxiliary memory. Quick Sort partitions around a pivot in O(n log n) average time in-place O(1) space, but degrades to O(n^2) with poor pivot choice.',
    workedExample: {
      title: 'Merge Step in Merge Sort',
      problem: 'Combine two sorted subarrays arr[low..mid] and arr[mid+1..high].',
      code: `void merge(vector<int> &arr, int low, int mid, int high) {
    vector<int> temp;
    int left = low, right = mid + 1;
    while (left <= mid && right <= high) {
        if (arr[left] <= arr[right]) temp.push_back(arr[left++]);
        else temp.push_back(arr[right++]);
    }
    while (left <= mid) temp.push_back(arr[left++]);
    while (right <= high) temp.push_back(arr[right++]);
    for (int i = low; i <= high; i++) arr[i] = temp[i - low];
}`,
      walkthrough: 'Merge sort guarantees stability and O(n log n) worst-case performance, making it the preferred algorithm for sorting linked lists.'
    },
    videoResource: {
      title: 'Merge Sort and Quick Sort Algorithms',
      channel: 'Abdul Bari',
      duration: '31 mins',
      url: 'https://www.youtube.com/watch?v=mB5HXBb_HY8'
    },
    bilingualNotes: {
      language: 'Hindi',
      summary: 'मर्ज सॉर्ट (Merge Sort) हमेशा O(n log n) समय लेता है लेकिन O(n) अतिरिक्त मेमोरी चाहिए। क्विक सॉर्ट (Quick Sort) आमतौर पर तेज होता है और इन-प्लेस काम करता है।',
      keyConceptTakeaway: 'लिंक्ड लिस्ट के लिए मर्ज सॉर्ट सबसे आदर्श एल्गोरिदम है।'
    },
    misconceptions: [
      {
        id: 'misc-sort-1',
        tag: 'CONFUSING_QUICK_VS_MERGE_WORST_CASE',
        description: 'Assuming Quick Sort is guaranteed O(n log n) in the worst case.',
        remedialAdvice: 'Quick Sort degrades to O(n^2) when the pivot divides the array into 0 and n-1 elements repeatedly (such as picking first element on an already sorted array).'
      }
    ]
  },

  // --- DBMS TOPICS ---
  {
    id: 'dbms-relational-model',
    subjectId: 'dbms',
    name: 'Relational Model & Schemas',
    code: 'DBMS-01',
    depth: 0,
    prerequisites: [],
    summary: 'The relational model represents data as relations (tables), where rows are tuples and columns are attributes. Every attribute has an atomic domain. Schemas define the structure and data types of the database relations.',
    workedExample: {
      title: 'Defining Relation Schema and Instance',
      problem: 'Distinguish schema definition from table instance.',
      code: `STUDENT(RollNo: INT, Name: VARCHAR(50), CGPA: FLOAT)
-- Schema is invariant structure; Instance is current set of rows.`,
      walkthrough: 'Schema represents metadata which rarely changes; Instance represents the dynamic population of tuples which changes with every INSERT, UPDATE, or DELETE.'
    },
    videoResource: {
      title: 'Relational Model Concepts and Relational Algebra',
      channel: 'Carnegie Mellon Database Group',
      duration: '40 mins',
      url: 'https://www.youtube.com/watch?v=uijHQXwQe3o'
    },
    bilingualNotes: {
      language: 'Hindi',
      summary: 'रिलेशनल मॉडल में डेटा तालिकाओं (Tables/Relations) में स्टोर होता है। पंक्ति को टुपल (Tuple) और कॉलम को एट्रिब्यूट (Attribute) कहा जाता है।',
      keyConceptTakeaway: 'स्कीमा = टेबल की संरचना (ढांचा); इन्स्टेंस = टेबल में मौजूद वर्तमान डेटा।'
    },
    misconceptions: [
      {
        id: 'misc-rel-1',
        tag: 'CONFUSING_SCHEMA_WITH_INSTANCE',
        description: 'Thinking altering table rows modifies the schema.',
        remedialAdvice: 'DML operations (insert/delete) modify the relation instance; only DDL operations (ALTER TABLE) modify the relation schema.'
      }
    ]
  },
  {
    id: 'dbms-keys-constraints',
    subjectId: 'dbms',
    name: 'Keys & Integrity Constraints',
    code: 'DBMS-02',
    depth: 1,
    prerequisites: ['dbms-relational-model'],
    summary: 'Super Key is any set of attributes that uniquely identifies a tuple. Candidate Key is a minimal Super Key (no redundant attributes). Primary Key is the chosen Candidate Key and can NEVER contain NULLs. Foreign Key enforces referential integrity.',
    workedExample: {
      title: 'Identifying Candidate Keys from Functional Dependencies',
      problem: 'Given relation R(A, B, C, D) with F = {A -> B, B -> C, C -> D}, determine all candidate keys.',
      code: `Attribute closure of A:
A+ = {A} -> {A, B} -> {A, B, C} -> {A, B, C, D} = all attributes of R.
Since A determines all attributes and is minimal (single attribute), A is a Candidate Key.`,
      walkthrough: 'Any set containing A (e.g., {A, B}, {A, C, D}) is a Super Key, but only {A} is minimal, so only {A} is a Candidate Key.'
    },
    videoResource: {
      title: 'Super Key, Candidate Key & Primary Key Explained',
      channel: 'Gate Smashers',
      duration: '14 mins',
      url: 'https://www.youtube.com/watch?v=5rT8X4vFv4E'
    },
    bilingualNotes: {
      language: 'Hindi',
      summary: 'सुपर की (Super Key) किसी भी पंक्ति को विशिष्ट रूप से पहचानती है। कैंडिडेट की (Candidate Key) न्यूनतम सुपर की होती है। प्राइमरी की में कभी NULL नहीं हो सकता।',
      keyConceptTakeaway: 'हर कैंडिडेट की सुपर की होती है, लेकिन हर सुपर की कैंडिडेट की नहीं होती।'
    },
    misconceptions: [
      {
        id: 'misc-keys-1',
        tag: 'PRIMARY_KEY_CANNOT_HAVE_NULL',
        description: 'Believing a Primary Key column can accept NULL values if all other values are unique.',
        remedialAdvice: 'Entity Integrity constraint strictly mandates: No component of a Primary Key may be NULL, because a NULL cannot uniquely identify an entity.'
      },
      {
        id: 'misc-keys-2',
        tag: 'SUPER_KEY_VS_CANDIDATE_KEY',
        description: 'Calling any unique column combination a Candidate Key without checking minimality.',
        remedialAdvice: 'If you remove an attribute from a candidate key, uniqueness must break. If uniqueness still holds, it was merely a Super Key with unnecessary baggage.'
      }
    ]
  },
  {
    id: 'dbms-sql-basics',
    subjectId: 'dbms',
    name: 'SQL DDL, DML & Aggregations',
    code: 'DBMS-03',
    depth: 2,
    prerequisites: ['dbms-keys-constraints'],
    summary: 'Structured Query Language (SQL). DDL (CREATE, ALTER, DROP) alters structure. DML (SELECT, INSERT, UPDATE, DELETE) manipulates data. Filtering is performed via WHERE (individual row level) and HAVING (aggregated group level).',
    workedExample: {
      title: 'WHERE vs HAVING Filtering with GROUP BY',
      problem: 'Find department IDs where the average student GPA exceeds 3.5, considering only students admitted after 2022.',
      code: `SELECT DeptId, AVG(GPA) AS AvgGPA
FROM Students
WHERE AdmissionYear > 2022   -- Row filter applied BEFORE grouping
GROUP BY DeptId
HAVING AVG(GPA) > 3.5;       -- Aggregate filter applied AFTER grouping`,
      walkthrough: 'WHERE cannot be applied to aggregate functions like AVG or COUNT; it acts before groups are created. HAVING filters the result of group aggregates.'
    },
    videoResource: {
      title: 'Complete SQL Fundamentals Course',
      channel: 'freeCodeCamp',
      duration: '45 mins',
      url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY'
    },
    bilingualNotes: {
      language: 'Hindi',
      summary: 'SQL में WHERE क्लॉज ग्रुप बनने से पहले व्यक्तिगत पंक्तियों को फ़िल्टर करता है। HAVING क्लॉज ग्रुप बनने के बाद एग्रीगेट फ़ंक्शन (जैसे AVG, SUM) पर लागू होता है।',
      keyConceptTakeaway: 'WHERE = ग्रुपिंग से पहले; HAVING = GROUP BY के बाद एग्रीगेट्स पर।'
    },
    misconceptions: [
      {
        id: 'misc-sql-1',
        tag: 'WHERE_WITH_AGGREGATE_ERROR',
        description: 'Placing aggregate functions directly inside the WHERE clause (e.g. WHERE AVG(marks) > 75).',
        remedialAdvice: 'WHERE filters rows before groups are formed, so aggregates are undefined in WHERE. Use HAVING for aggregate conditions.'
      }
    ]
  },
  {
    id: 'dbms-joins',
    subjectId: 'dbms',
    name: 'SQL Joins & Relational Algebra',
    code: 'DBMS-04',
    depth: 3,
    prerequisites: ['dbms-sql-basics'],
    summary: 'INNER JOIN matches rows with matching keys in both tables. LEFT OUTER JOIN keeps all rows from left table and populates NULL for missing right table matches. RIGHT OUTER JOIN and FULL OUTER JOIN preserve missing tuples accordingly.',
    workedExample: {
      title: 'Finding Students with No Enrolled Courses',
      problem: 'List all students who have not enrolled in any course.',
      code: `SELECT s.StudentId, s.Name
FROM Students s
LEFT JOIN Enrollments e ON s.StudentId = e.StudentId
WHERE e.CourseId IS NULL; -- Detects rows with no enrollment match!`,
      walkthrough: 'An INNER JOIN would omit these students entirely. A LEFT JOIN pairs them with NULLs, allowing WHERE e.CourseId IS NULL to isolate students without courses.'
    },
    videoResource: {
      title: 'SQL Joins Explained Visually',
      channel: 'Fireship',
      duration: '10 mins',
      url: 'https://www.youtube.com/watch?v=9yeOJ0ZMUYw'
    },
    bilingualNotes: {
      language: 'Hindi',
      summary: 'INNER JOIN केवल वही पंक्तियां देता है जो दोनों तालिकाओं में मेल खाती हैं। LEFT JOIN बाईं तालिका की सभी पंक्तियां रखता है, भले ही दाईं ओर कोई मेल न हो (वहां NULL आता है)।',
      keyConceptTakeaway: 'अगर बिना रिकॉर्ड वाले छात्रों को भी दिखाना है तो INNER JOIN नहीं, LEFT JOIN इस्तेमाल करें।'
    },
    misconceptions: [
      {
        id: 'misc-join-1',
        tag: 'ASSUMING_INNER_PRESERVES_UNMATCHED',
        description: 'Using INNER JOIN expecting rows without matches to appear in results.',
        remedialAdvice: 'INNER JOIN drops any row that fails the join predicate. Use OUTER JOIN (LEFT, RIGHT, FULL) when unmatched entities must be retained.'
      }
    ]
  },
  {
    id: 'dbms-functional-dependencies',
    subjectId: 'dbms',
    name: 'Functional Dependencies & Closure',
    code: 'DBMS-05',
    depth: 1,
    prerequisites: ['dbms-relational-model'],
    summary: 'A Functional Dependency X -> Y states that if two tuples agree on attributes X, they must also agree on attributes Y. Armstrong axioms (Reflexivity, Augmentation, Transitivity) govern inference. Attribute closure X+ determines candidate keys.',
    workedExample: {
      title: 'Computing Attribute Closure X+',
      problem: 'Given R(A, B, C, D, E) and F = {A -> B, BC -> D, E -> C}. Compute closure of {A, E}.',
      code: `Start: {A, E}+ = {A, E}
1. Since A -> B, add B => {A, B, E}
2. Since E -> C, add C => {A, B, C, E}
3. Since BC -> D and {B, C} subset, add D => {A, B, C, D, E}
Final closure: {A, E}+ = {A, B, C, D, E} = R. Therefore {A, E} is a superkey!`,
      walkthrough: 'Iteratively expanding the set using dependencies until no further attributes can be added gives the complete closure.'
    },
    videoResource: {
      title: 'Functional Dependencies and Armstrong Axioms',
      channel: 'NPTEL Computer Science',
      duration: '32 mins',
      url: 'https://www.youtube.com/watch?v=lUfW2dZ-k8o'
    },
    bilingualNotes: {
      language: 'Hindi',
      summary: 'कार्यात्मक निर्भरता (Functional Dependency) X -> Y का अर्थ है कि X का मान जानने पर Y का मान तय हो जाता है। क्लोजर (Closure) से हम कैंडिडेट की निकालते हैं।',
      keyConceptTakeaway: 'यदि X+ तालिका के सभी एट्रिब्यूट्स को कवर कर ले, तो X एक सुपर की बन जाता है।'
    },
    misconceptions: [
      {
        id: 'misc-fd-1',
        tag: 'CONFUSING_FD_DIRECTIONALITY',
        description: 'Assuming X -> Y implies Y -> X (e.g. StudentId determines Dept implies Dept determines StudentId).',
        remedialAdvice: 'Functional dependencies are strictly one-way mappings. Many students share the same department, so Dept does NOT determine StudentId.'
      }
    ]
  },
  {
    id: 'dbms-normalization',
    subjectId: 'dbms',
    name: 'Normalization (1NF, 2NF, 3NF, BCNF)',
    code: 'DBMS-06',
    depth: 2,
    prerequisites: ['dbms-functional-dependencies', 'dbms-keys-constraints'],
    summary: 'Decomposition of relational schemas to eliminate redundancy and insertion/deletion anomalies. 1NF requires atomic values. 2NF removes partial dependency on candidate keys. 3NF removes transitive dependencies (X -> Y where X is superkey or Y is prime). BCNF requires X to be a superkey for every non-trivial X -> Y.',
    workedExample: {
      title: 'Detecting 2NF Violation',
      problem: 'R(StudentId, CourseId, StudentName, Grade). Candidate key = {StudentId, CourseId}. StudentId -> StudentName.',
      code: `Primary Key: {StudentId, CourseId}
Dependency: StudentId -> StudentName
Here, StudentName depends only on part of the candidate key (StudentId), not the whole key!
This is a PARTIAL DEPENDENCY, violating 2NF!`,
      walkthrough: 'To decompose into 2NF: split into R1(StudentId, StudentName) and R2(StudentId, CourseId, Grade). This eliminates redundant student name storage.'
    },
    videoResource: {
      title: 'Database Normalization: 1NF, 2NF, 3NF & BCNF',
      channel: 'Deconstruct Database',
      duration: '28 mins',
      url: 'https://www.youtube.com/watch?v=GFQaEYEc8_8'
    },
    bilingualNotes: {
      language: 'Hindi',
      summary: 'नॉर्मलाइजेशन (Normalization) डेटा डुप्लीकेशन को खत्म करता है। 2NF में पार्टशियल डिपेंडेंसी नहीं होनी चाहिए। 3NF में ट्रांजिटिव डिपेंडेंसी हटाई जाती है।',
      keyConceptTakeaway: '2NF = कैंडिडेट की के आधे हिस्से पर निर्भरता नहीं होनी चाहिए। 3NF = नॉन-प्राइम एट्रिब्यूट दूसरे नॉन-प्राइम पर निर्भर न हो।'
    },
    misconceptions: [
      {
        id: 'misc-norm-1',
        tag: 'PARTIAL_VS_TRANSITIVE_CONFUSION',
        description: 'Confusing 2NF partial dependencies with 3NF transitive dependencies.',
        remedialAdvice: 'Partial dependency occurs when a non-prime attribute depends on a proper SUBSET of a composite candidate key. Transitive dependency occurs when non-prime depends on another non-prime attribute.'
      },
      {
        id: 'misc-norm-2',
        tag: 'ASSUMING_SINGLE_ATTRIBUTE_KEY_VIOLATES_2NF',
        description: 'Checking 2NF on relations with a single-attribute candidate key.',
        remedialAdvice: 'If every candidate key is a single attribute (not composite), the relation is AUTOMATICALLY in 2NF, because a single attribute has no proper subsets!'
      }
    ]
  },

  // --- JAVA PROGRAMMING TOPICS ---
  {
    id: 'java-basics',
    subjectId: 'java',
    name: 'Variables, Types & Operators',
    code: 'JAVA-01',
    depth: 0,
    prerequisites: [],
    summary: 'Java is strongly typed with primitive types (byte, short, int, long, float, double, boolean, char) stored on stack, and reference types pointing to heap objects. Arithmetic operators follow strict type promotion rules.',
    workedExample: {
      title: 'Integer Division Truncation',
      problem: 'What is the evaluated result of double result = 5 / 2; in Java?',
      code: `double result1 = 5 / 2;       // Evaluates to 2.0 (integer division happens FIRST!)
double result2 = 5.0 / 2;     // Evaluates to 2.5 (double literal promotes operation)`,
      walkthrough: 'Both 5 and 2 are int literals, so 5 / 2 evaluates to integer 2 before assignment to double result1, truncating the fractional part.'
    },
    videoResource: {
      title: 'Java Fundamentals: Types, Variables and Memory Stack',
      channel: 'Telusko',
      duration: '20 mins',
      url: 'https://www.youtube.com/watch?v=eIrMbAQSU34'
    },
    bilingualNotes: {
      language: 'Hindi',
      summary: 'जावा स्ट्रॉन्गली टाइप्ड भाषा है। 5 / 2 करने पर उत्तर 2 आता है (दशमलव कट जाता है), क्योंकि दोनों पूर्णांक हैं। 2.5 पाने के लिए 5.0 / 2 लिखना जरूरी है।',
      keyConceptTakeaway: 'प्रिमिटिव डेटा स्टैक मेमोरी में रहता है, जबकि ऑब्जेक्ट्स हीप में बनते हैं।'
    },
    misconceptions: [
      {
        id: 'misc-j-1',
        tag: 'INTEGER_DIVISION_TRUNCATION',
        description: 'Assuming dividing two integers assigned to a double variable preserves decimal fractions.',
        remedialAdvice: 'Division happens before assignment. Cast at least one operand to double: (double) a / b.'
      }
    ]
  },
  {
    id: 'java-classes',
    subjectId: 'java',
    name: 'Classes, Objects & Constructors',
    code: 'JAVA-02',
    depth: 1,
    prerequisites: ['java-basics'],
    summary: 'A class is a blueprint for objects. Constructors initialize instance state. The static keyword allocates members once per class on method area, shared across all instances, whereas non-static members exist per instance on heap.',
    workedExample: {
      title: 'Static vs Instance Counter',
      problem: 'Track how many instances of Student have been created across an application.',
      code: `public class Student {
    private String name;
    public static int totalStudents = 0; // Shared across ALL objects!

    public Student(String name) {
        this.name = name;
        totalStudents++; // Increments shared static counter
    }
}`,
      walkthrough: 'If totalStudents were not static, each instance would possess its own separate count of 1. Static variables belong to the Class metadata, persisting across instances.'
    },
    videoResource: {
      title: 'Classes and Objects in Java Explained',
      channel: 'Bro Code',
      duration: '16 mins',
      url: 'https://www.youtube.com/watch?v=7MUEVqVv_yY'
    },
    bilingualNotes: {
      language: 'Hindi',
      summary: 'क्लास एक खाका (Blueprint) है और ऑब्जेक्ट उसका रूप है। static सदस्य पूरी क्लास के लिए एक ही बार मेमोरी लेते हैं और सभी ऑब्जेक्ट्स द्वारा साझा किए जाते हैं।',
      keyConceptTakeaway: 'static = क्लास का सदस्य (शेयर्ड); गैर-static = हर ऑब्जेक्ट की अपनी निजी कॉपी।'
    },
    misconceptions: [
      {
        id: 'misc-j-2',
        tag: 'STATIC_MODIFIER_ISOLATION_CONFUSION',
        description: 'Assuming static variables are reset when a new object instance is constructed.',
        remedialAdvice: 'Static fields exist independently of individual object lifecycles; modifying a static variable in one object affects all other objects.'
      }
    ]
  },
  {
    id: 'java-inheritance',
    subjectId: 'java',
    name: 'Inheritance & Super Keyword',
    code: 'JAVA-03',
    depth: 2,
    prerequisites: ['java-classes'],
    summary: 'Inheritance allows a subclass to inherit attributes and methods from a superclass using extends. The super keyword invokes superclass constructors or methods. Subclass constructors always invoke super() as their first statement.',
    workedExample: {
      title: 'Invoking Superclass Parameterized Constructor',
      problem: 'Initialize base Employee fields from Manager subclass constructor.',
      code: `class Employee {
    String name;
    public Employee(String name) { this.name = name; }
}
class Manager extends Employee {
    int teamSize;
    public Manager(String name, int teamSize) {
        super(name); // MUST be first statement in subclass constructor!
        this.teamSize = teamSize;
    }
}`,
      walkthrough: 'If Employee has no default no-arg constructor, Manager MUST explicitly invoke super(name). Omitting this causes compile error "Implicit super constructor is undefined".'
    },
    videoResource: {
      title: 'Java Inheritance & Super Keyword Masterclass',
      channel: 'Programming with Mosh',
      duration: '24 mins',
      url: 'https://www.youtube.com/watch?v=zbUPb3o-v_E'
    },
    bilingualNotes: {
      language: 'Hindi',
      summary: 'इनहेरिटेंस (Inheritance) में सब-क्लास सुपर-क्लास के गुणों को प्राप्त करती है। सब-क्लास के कंस्ट्रक्टर में super() हमेशा पहली लाइन होनी चाहिए।',
      keyConceptTakeaway: 'super() का उपयोग पैरेंट क्लास के कंस्ट्रक्टर को कॉल करने के लिए किया जाता है।'
    },
    misconceptions: [
      {
        id: 'misc-j-3',
        tag: 'SUPER_NOT_FIRST_STATEMENT',
        description: 'Placing logic statements before super() call in subclass constructor.',
        remedialAdvice: 'Java compiler strictly requires super() or this() constructor calls to be the very first statement.'
      }
    ]
  },
  {
    id: 'java-polymorphism',
    subjectId: 'java',
    name: 'Polymorphism & Method Overriding',
    code: 'JAVA-04',
    depth: 3,
    prerequisites: ['java-inheritance'],
    summary: 'Dynamic Method Dispatch enables runtime polymorphism: a superclass reference pointing to a subclass object executes the overridden subclass method at runtime. Compile-time method overloading relies on distinct parameter signatures.',
    workedExample: {
      title: 'Dynamic Method Dispatch in Animal Hierarchy',
      problem: 'Determine which method executes when Animal a = new Dog(); a.makeSound(); is run.',
      code: `class Animal {
    void makeSound() { System.out.println("Generic sound"); }
}
class Dog extends Animal {
    @Override
    void makeSound() { System.out.println("Bark!"); }
}
Animal a = new Dog(); // Superclass reference, Subclass object
a.makeSound();        // Prints "Bark!" via runtime dynamic dispatch`,
      walkthrough: 'At compile time, Java checks Animal for existence of makeSound(). At runtime, the JVM looks at the actual object instance on the heap (Dog) and calls Dog.makeSound().'
    },
    videoResource: {
      title: 'Polymorphism in Java Explained Simply',
      channel: 'Alex Lee',
      duration: '14 mins',
      url: 'https://www.youtube.com/watch?v=0xw06loTm1A'
    },
    bilingualNotes: {
      language: 'Hindi',
      summary: 'पॉलीमॉर्फिज्म (Polymorphism) का मतलब है एक ही मेथड के कई रूप। पैरेंट क्लास का रेफरेंस चाइल्ड क्लास के ऑब्जेक्ट को पॉइंट कर सकता है और रनटाइम पर चाइल्ड का मेथड ही चलेगा।',
      keyConceptTakeaway: 'मेथड कॉल का निर्णय रनटाइम पर ऑब्जेक्ट के वास्तविक प्रकार (हीप) के आधार पर होता है।'
    },
    misconceptions: [
      {
        id: 'misc-j-4',
        tag: 'COMPILE_VS_RUNTIME_TYPE_CONFUSION',
        description: 'Expecting methods unique only to Dog (not in Animal) to be callable on Animal ref = new Dog().',
        remedialAdvice: 'Compiler only permits methods declared in the REFERENCE type (Animal). If Dog has fetch(), ref.fetch() fails compilation unless explicitly downcast.'
      }
    ]
  }
];

export const INITIAL_QUESTIONS: Question[] = [
  // --- DSA: POINTERS QUESTIONS ---
  {
    id: 'q-ptr-01',
    topicId: 'dsa-pointers',
    subjectId: 'dsa',
    difficulty: 'easy',
    text: 'What is printed by the following C code snippet?',
    codeSnippet: `int a = 10;
int *p = &a;
*p = 25;
printf("%d", a);`,
    options: [
      { id: 'opt-a', text: '10', misconceptionTag: 'DEREF_IGNORED', misconceptionExplanation: 'You assumed modifying *p does not affect the underlying variable a. *p directly writes into a\'s memory cell.' },
      { id: 'opt-b', text: '25', misconceptionTag: undefined },
      { id: 'opt-c', text: 'Memory address of a', misconceptionTag: 'DEREF_VS_ADDRESS_CONFUSION', misconceptionExplanation: 'You confused the address with the dereferenced value. printf("%d", a) prints the stored integer 25.' },
      { id: 'opt-d', text: 'Segmentation Fault', misconceptionTag: 'UNINITIALIZED_POINTER_ASSUMPTION', misconceptionExplanation: 'p was properly initialized with &a, so no invalid memory dereferencing occurred.' }
    ],
    correctOptionId: 'opt-b',
    explanation: 'p points to memory address of a. *p = 25 modifies the value stored at that address, so a becomes 25.',
    misconceptionFocus: 'DEREF_VS_ADDRESS_CONFUSION',
    remedialFollowUp: {
      text: 'If int x = 50; int *ptr = &x; what does (*ptr + 5) evaluate to?',
      options: ['55', '50', 'Address of x + 5 bytes', 'Compilation error'],
      correctIndex: 0,
      explanation: '*ptr accesses 50, adding 5 gives 55.'
    }
  },
  {
    id: 'q-ptr-02',
    topicId: 'dsa-pointers',
    subjectId: 'dsa',
    difficulty: 'medium',
    text: 'Consider the following code. What is the value of **q?',
    codeSnippet: `int val = 99;
int *p = &val;
int **q = &p;`,
    options: [
      { id: 'opt-a', text: 'Memory address of val', misconceptionTag: 'SINGLE_DEREF_CONFUSION', misconceptionExplanation: '*q gives &val (the address), but double dereference **q unpacks the integer itself.' },
      { id: 'opt-b', text: 'Memory address of p', misconceptionTag: 'DEREF_VS_ADDRESS_CONFUSION', misconceptionExplanation: 'q is &p, so *q is p, and **q is *p which is 99.' },
      { id: 'opt-c', text: '99', misconceptionTag: undefined },
      { id: 'opt-d', text: 'Undefined behavior', misconceptionTag: 'DOUBLE_POINTER_MISUNDERSTANDING', misconceptionExplanation: 'Pointer-to-pointer syntax is fully valid and strictly defined.' }
    ],
    correctOptionId: 'opt-c',
    explanation: '**q first dereferences q to get pointer p, then dereferences p to read val (99).',
    misconceptionFocus: 'DEREF_VS_ADDRESS_CONFUSION'
  },
  {
    id: 'q-ptr-03',
    topicId: 'dsa-pointers',
    subjectId: 'dsa',
    difficulty: 'hard',
    text: 'What happens when free(ptr) is called on dynamic memory in C?',
    codeSnippet: `int *ptr = (int*)malloc(sizeof(int));
*ptr = 100;
free(ptr);`,
    options: [
      { id: 'opt-a', text: 'ptr is automatically set to NULL by the operating system', misconceptionTag: 'DANGLING_POINTER_DELETION', misconceptionExplanation: 'free() deallocates the heap memory, but does NOT reset the pointer variable ptr! ptr remains a dangerous dangling pointer.' },
      { id: 'opt-b', text: 'The heap memory is released, but ptr still holds the old address', misconceptionTag: undefined },
      { id: 'opt-c', text: 'The value at *ptr is guaranteed to remain 100 forever', misconceptionTag: 'HEAP_PERSISTENCE_CONFUSION', misconceptionExplanation: 'After free(), the memory is reclaimed and can be overwritten by other allocations at any instant.' },
      { id: 'opt-d', text: 'A segmentation fault occurs immediately on the line of free()', misconceptionTag: 'FREE_SYNTAX_ERROR', misconceptionExplanation: 'free() is standard deallocation and does not trigger segfault on valid pointers.' }
    ],
    correctOptionId: 'opt-b',
    explanation: 'free(ptr) informs the allocator that the chunk is available. The pointer variable itself retains the address (dangling pointer) until manually overwritten (e.g. ptr = NULL).',
    misconceptionFocus: 'DANGLING_POINTER_DELETION'
  },

  // --- DSA: LINKED LISTS QUESTIONS ---
  {
    id: 'q-ll-01',
    topicId: 'dsa-linked-lists',
    subjectId: 'dsa',
    difficulty: 'medium',
    text: 'What catastrophic bug occurs in the following function to insert at the head of a linked list?',
    codeSnippet: `void insertAtHead(struct Node** head, int val) {
    struct Node* newNode = (struct Node*)malloc(sizeof(struct Node));
    newNode->data = val;
    *head = newNode;
    newNode->next = *head;
}`,
    options: [
      { id: 'opt-a', text: 'Memory leak: newNode is lost', misconceptionTag: 'MALLOC_MISCONCEPTION', misconceptionExplanation: 'newNode is not lost; rather it creates a cyclic reference to itself.' },
      { id: 'opt-b', text: 'Creates an infinite self-loop and loses all existing nodes in the list', misconceptionTag: undefined },
      { id: 'opt-c', text: 'The code works correctly with no issues', misconceptionTag: 'ORPHANING_REST_OF_LIST', misconceptionExplanation: 'By setting *head = newNode first, newNode->next = *head sets newNode->next to ITSELF, orphaning all prior nodes!' },
      { id: 'opt-d', text: 'Compile error on struct Node** syntax', misconceptionTag: 'DOUBLE_POINTER_SYNTAX', misconceptionExplanation: 'Passing Node** is correct idiom to modify the caller\'s head pointer.' }
    ],
    correctOptionId: 'opt-b',
    explanation: 'Because *head was updated first to newNode, newNode->next = *head points the new node to itself, severing and permanently losing the rest of the list!',
    misconceptionFocus: 'ORPHANING_REST_OF_LIST',
    remedialFollowUp: {
      text: 'What is the correct sequence when inserting newNode before head?',
      options: [
        'newNode->next = head; head = newNode;',
        'head = newNode; newNode->next = head;',
        'head->next = newNode; head = newNode;',
        'free(head); head = newNode;'
      ],
      correctIndex: 0,
      explanation: 'Connect new node to the downstream chain first, then advance the head pointer.'
    }
  },
  {
    id: 'q-ll-02',
    topicId: 'dsa-linked-lists',
    subjectId: 'dsa',
    difficulty: 'hard',
    text: 'In a singly linked list with head pointer, what is the worst-case time complexity to delete the LAST node?',
    options: [
      { id: 'opt-a', text: 'O(1) because we can just call free(tail)', misconceptionTag: 'ORPHAN_PREDECESSOR_CONFUSION', misconceptionExplanation: 'Even if we hold a tail pointer, deleting the last node requires setting the SECOND-TO-LAST node\'s next to NULL, which requires O(n) traversal from head!' },
      { id: 'opt-b', text: 'O(n) because we must traverse to find the second-to-last node', misconceptionTag: undefined },
      { id: 'opt-c', text: 'O(log n)', misconceptionTag: 'BST_COMPLEXITY_CONFUSION', misconceptionExplanation: 'Linked lists do not allow binary search jumps.' },
      { id: 'opt-d', text: 'O(n^2)', misconceptionTag: 'QUADRATIC_OVERESTIMATE', misconceptionExplanation: 'Single linear scan to the (n-1)th node takes O(n).' }
    ],
    correctOptionId: 'opt-b',
    explanation: 'In a singly linked list, pointers only point forward. To delete the tail node, its predecessor must point to NULL, requiring an O(n) traversal from head.',
    misconceptionFocus: 'ORPHAN_PREDECESSOR_CONFUSION'
  },

  // --- DSA: BINARY TREES QUESTIONS ---
  {
    id: 'q-tree-01',
    topicId: 'dsa-binary-trees',
    subjectId: 'dsa',
    difficulty: 'medium',
    text: 'Is the following binary tree a valid Binary Search Tree (BST)?\nRoot = 20\nRoot.left = 10, Root.right = 30\nRoot.right.left = 15, Root.right.right = 35',
    options: [
      { id: 'opt-a', text: 'Yes, because 15 < 30 and 35 > 30 (local BST property holds)', misconceptionTag: 'ASSUMING_LOCAL_BST_SATISFIES_GLOBAL', misconceptionExplanation: 'You only checked immediate parent 30! But 15 is in the RIGHT subtree of root 20, where ALL keys must be strictly > 20. Since 15 < 20, it violates the global BST invariant!' },
      { id: 'opt-b', text: 'No, because node 15 in the right subtree is smaller than root 20', misconceptionTag: undefined },
      { id: 'opt-c', text: 'Yes, all binary trees are automatically BSTs', misconceptionTag: 'CONFUSING_BINARY_TREE_WITH_BST', misconceptionExplanation: 'Binary trees have no ordering constraints; only BSTs enforce ordering.' },
      { id: 'opt-d', text: 'No, because node 35 is greater than node 30', misconceptionTag: 'INVERTED_BST_LOGIC', misconceptionExplanation: 'Right child being greater than parent is correct BST behavior.' }
    ],
    correctOptionId: 'opt-b',
    explanation: 'In a BST, EVERY node in the right subtree of a root must be greater than that root. Here, 15 is in the right subtree of 20, which is invalid.',
    misconceptionFocus: 'ASSUMING_LOCAL_BST_SATISFIES_GLOBAL'
  },
  {
    id: 'q-tree-02',
    topicId: 'dsa-binary-trees',
    subjectId: 'dsa',
    difficulty: 'hard',
    text: 'A full binary tree has 7 internal nodes. How many leaf nodes does it possess?',
    options: [
      { id: 'opt-a', text: '7', misconceptionTag: 'EQUAL_LEAF_INTERNAL_MISCONCEPTION', misconceptionExplanation: 'Leaves and internal nodes are not equal in full binary trees.' },
      { id: 'opt-b', text: '8', misconceptionTag: undefined },
      { id: 'opt-c', text: '14', misconceptionTag: 'DOUBLING_MISCONCEPTION', misconceptionExplanation: 'You doubled the internal count; the theorem states L = I + 1.' },
      { id: 'opt-d', text: '15', misconceptionTag: 'TOTAL_NODES_CONFUSION', misconceptionExplanation: '15 is the total number of nodes (2 * 7 + 1), not the number of leaf nodes.' }
    ],
    correctOptionId: 'opt-b',
    explanation: 'For any full binary tree (where every node has 0 or 2 children), the number of leaf nodes L = I + 1. With 7 internal nodes, L = 7 + 1 = 8.',
    misconceptionFocus: 'TOTAL_NODES_CONFUSION'
  },

  // --- DBMS: KEYS & CONSTRAINTS QUESTIONS ---
  {
    id: 'q-dbms-key-01',
    topicId: 'dbms-keys-constraints',
    subjectId: 'dbms',
    difficulty: 'easy',
    text: 'Can a column designated as PRIMARY KEY contain NULL values in a relational database?',
    options: [
      { id: 'opt-a', text: 'Yes, up to one NULL is allowed', misconceptionTag: 'PRIMARY_KEY_CANNOT_HAVE_NULL', misconceptionExplanation: 'You confused UNIQUE constraint with PRIMARY KEY! UNIQUE allows one NULL in SQL, but PRIMARY KEY strictly forbids any NULLs.' },
      { id: 'opt-b', text: 'No, Entity Integrity strictly prohibits NULL in any part of a Primary Key', misconceptionTag: undefined },
      { id: 'opt-c', text: 'Yes, if defined with NULL keyword', misconceptionTag: 'SQL_DDL_OVERRIDE_CONFUSION', misconceptionExplanation: 'SQL standard disallows NULL in primary key declarations.' },
      { id: 'opt-d', text: 'Only if the table contains fewer than 10 rows', misconceptionTag: 'ROW_DEPENDENT_CONSTRAINT', misconceptionExplanation: 'Integrity constraints are invariant regardless of table size.' }
    ],
    correctOptionId: 'opt-b',
    explanation: 'By relational entity integrity rule, Primary Key must uniquely identify entities. A NULL represents unknown/missing information and can never guarantee uniqueness.',
    misconceptionFocus: 'PRIMARY_KEY_CANNOT_HAVE_NULL'
  },
  {
    id: 'q-dbms-key-02',
    topicId: 'dbms-keys-constraints',
    subjectId: 'dbms',
    difficulty: 'medium',
    text: 'What distinguishes a Candidate Key from a Super Key?',
    options: [
      { id: 'opt-a', text: 'A Candidate Key is minimal with no redundant attributes, while a Super Key may contain redundant attributes', misconceptionTag: undefined },
      { id: 'opt-b', text: 'Super Keys can have NULLs while Candidate Keys cannot', misconceptionTag: 'KEY_NULL_RULE_CONFUSION', misconceptionExplanation: 'Minimality, not nullability, distinguishes super keys from candidate keys.' },
      { id: 'opt-c', text: 'They are identical concepts with different naming', misconceptionTag: 'SUPER_KEY_VS_CANDIDATE_KEY', misconceptionExplanation: 'Super Key is any superset of a candidate key.' },
      { id: 'opt-d', text: 'A Candidate Key must always consist of exactly one single attribute', misconceptionTag: 'SINGLE_ATTRIBUTE_KEY_BIAS', misconceptionExplanation: 'Candidate keys can be composite (multiple attributes) as long as minimal.' }
    ],
    correctOptionId: 'opt-a',
    explanation: 'A candidate key is a minimal super key: removing any attribute destroys the uniqueness property.',
    misconceptionFocus: 'SUPER_KEY_VS_CANDIDATE_KEY'
  },

  // --- DBMS: NORMALIZATION QUESTIONS ---
  {
    id: 'q-dbms-norm-01',
    topicId: 'dbms-normalization',
    subjectId: 'dbms',
    difficulty: 'medium',
    text: 'Relation R(A, B, C, D) has candidate key {A, B} and functional dependencies: {A, B} -> C and A -> D. Which normal form is violated?',
    options: [
      { id: 'opt-a', text: '1NF', misconceptionTag: 'ATOMICITY_CONFUSION', misconceptionExplanation: 'All attributes are atomic; 1NF is satisfied.' },
      { id: 'opt-b', text: '2NF because D depends on proper subset A of candidate key {A, B}', misconceptionTag: undefined },
      { id: 'opt-c', text: '3NF only, but 2NF is satisfied', misconceptionTag: 'PARTIAL_VS_TRANSITIVE_CONFUSION', misconceptionExplanation: 'A -> D is a partial dependency (D depends on part of composite key {A, B}), which violates 2NF immediately.' },
      { id: 'opt-d', text: 'BCNF only', misconceptionTag: 'BCNF_SUPERKEY_MISINTERPRETATION', misconceptionExplanation: 'It already fails 2NF, so higher normal forms cannot be satisfied.' }
    ],
    correctOptionId: 'opt-b',
    explanation: 'In 2NF, no non-prime attribute (D) can be functionally dependent on a proper subset (A) of candidate key ({A, B}). A -> D is a partial dependency.',
    misconceptionFocus: 'PARTIAL_VS_TRANSITIVE_CONFUSION'
  },

  // --- JAVA: POLYMORPHISM QUESTIONS ---
  {
    id: 'q-java-poly-01',
    topicId: 'java-polymorphism',
    subjectId: 'java',
    difficulty: 'medium',
    text: 'What is the output of the following Java program?',
    codeSnippet: `class Parent {
    void show() { System.out.print("P "); }
}
class Child extends Parent {
    void show() { System.out.print("C "); }
}
public class Test {
    public static void main(String[] args) {
        Parent p = new Child();
        p.show();
    }
}`,
    options: [
      { id: 'opt-a', text: 'P ', misconceptionTag: 'STATIC_BINDING_MISCONCEPTION', misconceptionExplanation: 'You assumed Java binds methods based on reference type Parent. In Java, non-static methods use dynamic method dispatch based on actual runtime object type (Child).' },
      { id: 'opt-b', text: 'C ', misconceptionTag: undefined },
      { id: 'opt-c', text: 'Compile error on Parent p = new Child()', misconceptionTag: 'UPCASTING_ILLEGAL_ASSUMPTION', misconceptionExplanation: 'Upcasting from Child to Parent is always valid and implicit.' },
      { id: 'opt-d', text: 'P C ', misconceptionTag: 'CONSTRUCTOR_CHAINING_CONFUSION', misconceptionExplanation: 'show() is an ordinary overridden method, not constructor chaining.' }
    ],
    correctOptionId: 'opt-b',
    explanation: 'Java uses virtual method invocation by default. Since the runtime object on the heap is Child, Child\'s overridden show() executes, printing "C ".',
    misconceptionFocus: 'COMPILE_VS_RUNTIME_TYPE_CONFUSION'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  // --- STAR DEMO STUDENT: Ananya Sharma ---
  // She failed Trees (40%), Linked Lists is mediocre (52%), Pointers is root cause (32%)!
  {
    id: 'stud-ananya',
    rollNumber: '22CS084',
    name: 'Ananya Sharma',
    email: 'ananya.sharma@bvrithyderabad.edu.in',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    semester: 3,
    section: 'CSE-A',
    department: 'Computer Science & Engineering',
    attendanceRate: 0.64, // 64% attendance (below 75% threshold)
    points: 120,
    streak: 3,
    lastActive: '2026-10-12T14:30:00Z',
    completedTasks: ['dsa-pointers-review'],
    integrityLogs: [
      {
        id: 'int-log-1',
        studentId: 'stud-ananya',
        studentName: 'Ananya Sharma',
        timestamp: '2026-10-11T10:14:22Z',
        eventType: 'TAB_SWITCH',
        assessmentTitle: 'Mid-Sem Diagnostic Quiz #2',
        severity: 'warning',
        details: 'Browser tab switched away for 6.2 seconds before returning.'
      }
    ]
  },
  {
    id: 'stud-rohan',
    rollNumber: '22CS045',
    name: 'Rohan Varma',
    email: 'rohan.varma@bvrithyderabad.edu.in',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    semester: 3,
    section: 'CSE-A',
    department: 'Computer Science & Engineering',
    attendanceRate: 0.82,
    points: 210,
    streak: 6,
    lastActive: '2026-10-12T18:15:00Z',
    completedTasks: [],
    integrityLogs: []
  },
  {
    id: 'stud-sneha',
    rollNumber: '22CS102',
    name: 'Sneha Patel',
    email: 'sneha.patel@bvrithyderabad.edu.in',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    semester: 3,
    section: 'CSE-B',
    department: 'Computer Science & Engineering',
    attendanceRate: 0.94,
    points: 480,
    streak: 14,
    lastActive: '2026-10-12T20:05:00Z',
    completedTasks: ['dsa-pointers-review', 'dsa-ll-quiz', 'dbms-norm-drill'],
    integrityLogs: []
  },
  {
    id: 'stud-vikram',
    rollNumber: '22CS019',
    name: 'Vikram Reddy',
    email: 'vikram.reddy@bvrithyderabad.edu.in',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    semester: 3,
    section: 'CSE-B',
    department: 'Computer Science & Engineering',
    attendanceRate: 0.58,
    points: 90,
    streak: 1,
    lastActive: '2026-10-10T11:45:00Z',
    completedTasks: [],
    integrityLogs: [
      {
        id: 'int-log-2',
        studentId: 'stud-vikram',
        studentName: 'Vikram Reddy',
        timestamp: '2026-10-09T09:20:10Z',
        eventType: 'FULLSCREEN_EXIT',
        assessmentTitle: 'DSA Lab Exam Evaluation',
        severity: 'flagged',
        details: 'Exited fullscreen mode; external browser window active for 14.5 seconds.'
      }
    ]
  },
  {
    id: 'stud-priya',
    rollNumber: '22CS091',
    name: 'Priya Nair',
    email: 'priya.nair@bvrithyderabad.edu.in',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    semester: 3,
    section: 'CSE-A',
    department: 'Computer Science & Engineering',
    attendanceRate: 0.79,
    points: 290,
    streak: 8,
    lastActive: '2026-10-12T16:50:00Z',
    completedTasks: [],
    integrityLogs: []
  }
];

export const INITIAL_ATTEMPTS: Attempt[] = [
  // --- ANANYA'S ATTEMPTS ---
  // DSA Pointers: mostly incorrect (32% mastery)
  { id: 'att-1', studentId: 'stud-ananya', questionId: 'q-ptr-01', topicId: 'dsa-pointers', isCorrect: false, chosenOptionId: 'opt-c', misconceptionTag: 'DEREF_VS_ADDRESS_CONFUSION', timestamp: '2026-10-05T09:12:00Z', difficultyWeight: 1.0 },
  { id: 'att-2', studentId: 'stud-ananya', questionId: 'q-ptr-02', topicId: 'dsa-pointers', isCorrect: false, chosenOptionId: 'opt-a', misconceptionTag: 'SINGLE_DEREF_CONFUSION', timestamp: '2026-10-05T09:18:00Z', difficultyWeight: 1.0 },
  { id: 'att-3', studentId: 'stud-ananya', questionId: 'q-ptr-03', topicId: 'dsa-pointers', isCorrect: false, chosenOptionId: 'opt-a', misconceptionTag: 'DANGLING_POINTER_DELETION', timestamp: '2026-10-06T11:20:00Z', difficultyWeight: 1.3 },

  // DSA Linked Lists: shaky (52% mastery)
  { id: 'att-4', studentId: 'stud-ananya', questionId: 'q-ll-01', topicId: 'dsa-linked-lists', isCorrect: false, chosenOptionId: 'opt-c', misconceptionTag: 'ORPHANING_REST_OF_LIST', timestamp: '2026-10-08T10:00:00Z', difficultyWeight: 1.0 },
  { id: 'att-5', studentId: 'stud-ananya', questionId: 'q-ll-02', topicId: 'dsa-linked-lists', isCorrect: true, chosenOptionId: 'opt-b', timestamp: '2026-10-08T10:05:00Z', difficultyWeight: 1.2 },

  // DSA Trees: struggling (40% mastery) -> Symptom!
  { id: 'att-6', studentId: 'stud-ananya', questionId: 'q-tree-01', topicId: 'dsa-binary-trees', isCorrect: false, chosenOptionId: 'opt-a', misconceptionTag: 'ASSUMING_LOCAL_BST_SATISFIES_GLOBAL', timestamp: '2026-10-10T14:10:00Z', difficultyWeight: 1.1 },
  { id: 'att-7', studentId: 'stud-ananya', questionId: 'q-tree-02', topicId: 'dsa-binary-trees', isCorrect: false, chosenOptionId: 'opt-c', misconceptionTag: 'DOUBLING_MISCONCEPTION', timestamp: '2026-10-10T14:15:00Z', difficultyWeight: 1.3 },

  // DBMS Keys & Normalization:
  { id: 'att-8', studentId: 'stud-ananya', questionId: 'q-dbms-key-01', topicId: 'dbms-keys-constraints', isCorrect: true, chosenOptionId: 'opt-b', timestamp: '2026-10-09T15:00:00Z', difficultyWeight: 0.9 },
  { id: 'att-9', studentId: 'stud-ananya', questionId: 'q-dbms-norm-01', topicId: 'dbms-normalization', isCorrect: false, chosenOptionId: 'opt-c', misconceptionTag: 'PARTIAL_VS_TRANSITIVE_CONFUSION', timestamp: '2026-10-09T15:10:00Z', difficultyWeight: 1.1 },

  // --- SNEHA'S ATTEMPTS (Top student) ---
  { id: 'att-10', studentId: 'stud-sneha', questionId: 'q-ptr-01', topicId: 'dsa-pointers', isCorrect: true, chosenOptionId: 'opt-b', timestamp: '2026-10-07T08:00:00Z', difficultyWeight: 1.0 },
  { id: 'att-11', studentId: 'stud-sneha', questionId: 'q-ptr-02', topicId: 'dsa-pointers', isCorrect: true, chosenOptionId: 'opt-c', timestamp: '2026-10-07T08:05:00Z', difficultyWeight: 1.0 },
  { id: 'att-12', studentId: 'stud-sneha', questionId: 'q-ptr-03', topicId: 'dsa-pointers', isCorrect: true, chosenOptionId: 'opt-b', timestamp: '2026-10-07T08:10:00Z', difficultyWeight: 1.3 },
  { id: 'att-13', studentId: 'stud-sneha', questionId: 'q-ll-01', topicId: 'dsa-linked-lists', isCorrect: true, chosenOptionId: 'opt-b', timestamp: '2026-10-07T08:15:00Z', difficultyWeight: 1.0 },
  { id: 'att-14', studentId: 'stud-sneha', questionId: 'q-tree-01', topicId: 'dsa-binary-trees', isCorrect: true, chosenOptionId: 'opt-b', timestamp: '2026-10-07T08:20:00Z', difficultyWeight: 1.1 },

  // --- ROHAN'S ATTEMPTS ---
  { id: 'att-15', studentId: 'stud-rohan', questionId: 'q-ptr-01', topicId: 'dsa-pointers', isCorrect: true, chosenOptionId: 'opt-b', timestamp: '2026-10-06T14:00:00Z', difficultyWeight: 1.0 },
  { id: 'att-16', studentId: 'stud-rohan', questionId: 'q-ptr-02', topicId: 'dsa-pointers', isCorrect: false, chosenOptionId: 'opt-a', misconceptionTag: 'SINGLE_DEREF_CONFUSION', timestamp: '2026-10-06T14:05:00Z', difficultyWeight: 1.0 },
  { id: 'att-17', studentId: 'stud-rohan', questionId: 'q-dbms-norm-01', topicId: 'dbms-normalization', isCorrect: false, chosenOptionId: 'opt-c', misconceptionTag: 'PARTIAL_VS_TRANSITIVE_CONFUSION', timestamp: '2026-10-08T16:00:00Z', difficultyWeight: 1.1 },

  // --- VIKRAM'S ATTEMPTS ---
  { id: 'att-18', studentId: 'stud-vikram', questionId: 'q-ptr-01', topicId: 'dsa-pointers', isCorrect: false, chosenOptionId: 'opt-c', misconceptionTag: 'DEREF_VS_ADDRESS_CONFUSION', timestamp: '2026-10-04T12:00:00Z', difficultyWeight: 1.0 },
  { id: 'att-19', studentId: 'stud-vikram', questionId: 'q-ll-01', topicId: 'dsa-linked-lists', isCorrect: false, chosenOptionId: 'opt-c', misconceptionTag: 'ORPHANING_REST_OF_LIST', timestamp: '2026-10-04T12:05:00Z', difficultyWeight: 1.0 },
  { id: 'att-20', studentId: 'stud-vikram', questionId: 'q-java-poly-01', topicId: 'java-polymorphism', isCorrect: false, chosenOptionId: 'opt-a', misconceptionTag: 'STATIC_BINDING_MISCONCEPTION', timestamp: '2026-10-09T09:25:00Z', difficultyWeight: 1.1 }
];

export const INITIAL_PENDING_APPROVALS: PendingQuestionApproval[] = [
  {
    id: 'pq-1',
    topicId: 'dsa-pointers',
    subjectId: 'dsa',
    question: {
      id: 'q-ai-ptr-new',
      topicId: 'dsa-pointers',
      subjectId: 'dsa',
      difficulty: 'medium',
      text: 'What will be the output when incrementing a pointer to an array of integers (int arr[5]; int *p = arr; p++;)?',
      options: [
        { id: 'o1', text: 'Pointer address increases by 1 byte', misconceptionTag: 'POINTER_ARITHMETIC_BYTE_CONFUSION', misconceptionExplanation: 'Pointers advance by sizeof(datatype) bytes, not by 1 byte.' },
        { id: 'o2', text: 'Pointer address increases by sizeof(int) bytes (usually 4 bytes)', misconceptionTag: undefined },
        { id: 'o3', text: 'Value stored at arr[0] is incremented by 1', misconceptionTag: 'OPERATOR_PRECEDENCE_CONFUSION', misconceptionExplanation: 'p++ advances pointer position, whereas (*p)++ increments the value.' },
        { id: 'o4', text: 'Causes runtime memory violation', misconceptionTag: 'ARRAY_POINTER_FEAR', misconceptionExplanation: 'Array elements 0 to 4 are allocated, so p++ safely addresses arr[1].' }
      ],
      correctOptionId: 'o2',
      explanation: 'Pointer arithmetic is scaled by the size of the underlying type. In modern 32/64-bit systems, int is 4 bytes, so p++ advances address by 4.',
      misconceptionFocus: 'POINTER_ARITHMETIC_BYTE_CONFUSION'
    },
    generatedBy: 'AI Curated from Syllabus',
    generatedAt: '2026-10-12T19:00:00Z',
    syllabusExcerpt: 'Unit 1: Pointers in C - Memory organization, pointer arithmetic scaling by data type size.',
    status: 'pending'
  },
  {
    id: 'pq-2',
    topicId: 'dbms-normalization',
    subjectId: 'dbms',
    question: {
      id: 'q-ai-norm-new',
      topicId: 'dbms-normalization',
      subjectId: 'dbms',
      difficulty: 'hard',
      text: 'Which condition distinguishes Boyce-Codd Normal Form (BCNF) from 3rd Normal Form (3NF)?',
      options: [
        { id: 'o1', text: 'In BCNF, for every non-trivial X -> Y, X must be a superkey; whereas 3NF also allows Y to be a prime attribute', misconceptionTag: undefined },
        { id: 'o2', text: '3NF permits partial dependencies while BCNF forbids them', misconceptionTag: '2NF_BCNF_CONFUSION', misconceptionExplanation: 'Both 2NF and 3NF already forbid partial dependencies.' },
        { id: 'o3', text: 'BCNF requires multi-valued dependencies while 3NF does not', misconceptionTag: '4NF_CONFUSION', misconceptionExplanation: 'Multi-valued dependencies are addressed in 4th Normal Form (4NF).' },
        { id: 'o4', text: 'BCNF applies exclusively to single-attribute candidate keys', misconceptionTag: 'KEY_CARDINALITY_CONFUSION', misconceptionExplanation: 'BCNF applies universally across any candidate key.' }
      ],
      correctOptionId: 'o1',
      explanation: '3NF relaxes the condition by permitting non-superkey determinants if the right side Y is a prime attribute. BCNF strictly eliminates this exception.',
      misconceptionFocus: '2NF_BCNF_CONFUSION'
    },
    generatedBy: 'AI Curated from Syllabus',
    generatedAt: '2026-10-12T19:30:00Z',
    syllabusExcerpt: 'Unit 3: Relational Decomposition - Lossless join, dependency preservation, strict BCNF requirements.',
    status: 'pending'
  }
];
