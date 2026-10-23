# Reflection

**Name / Andrew ID:** Samantha Lu / slu4

**Recitation group members (Task 2):** N/A (did not have time to get to it in reci)

---

### 1. Valid but weak

Pick a property you wrote that passes on the correct implementation but
kills few or no mutants. Why is it still a *valid* property? Describe a
concrete bug (not one of our mutants) that it *would* catch.

One of the invariants for checking that start <= end helps to align with the specification that all intervals need to have valid endpoints, but it didn't kill mutants and doesn't help with merging checks. However, it does help to catch invalid intervals, such as [99, 2], which therefore makes it a valid property because it helps with that specific requirement.


### 2. A generator problem, not a property problem

Describe a mutant, from either task, that survived or was flaky because of
your **generator** rather than your property. What did the generator fail to
produce? How did you fix it? Paste the runner output from before and after.

The singlePass mutant was flaky because the generator that used the whole alphabet was unlikely to consistently generate input that had repeating letters. To fix this, we fed in a tiny alphabet (ABC) in order to force repeating letters.

Before:
```
~ singlePass     flaky: killed in 2/5 runs  by: never credits a letter more times than the secret contains it
      Counterexample: ["ABAAA","BBAAA"]
```

After:
```
✔ singlePass     killed  by: never credits a letter more times than the secret contains it
      Counterexample: ["AAAAB","AABAB"]
      AssertionError: expected 2 to be less than or equal to 1
```


### 3. Reading a counterexample

Paste one counterexample that the mutation runner printed for a killed
mutant. In 2–3 sentences, explain using the *specification* why that input
exposes the bug.

In the following example, there is a letter that is correct, but in the wrong position. However, it is marked incorrectly as black ('B'). This exposes the bug becaus it should've been marked as yellow ('Y'), for a letter that is in the secret word, but not in the right position.

```
greensOnly     killed  by: if letter is present but in wrong position, should be yellow
      AssertionError: expected [ 'B', 'B', 'G', 'G', 'G' ] to deeply equal [ 'B', 'Y', 'G', 'G', 'G' ]
```


### 4. Your project

Name one function or module in your team's project that would benefit from
property-based testing. State two properties in English, name the pattern of
each, and describe the generator you'd need, including anything about its
inputs that a naive generator would get wrong.

The feature that I implmented would definitely benefit from PBT. More specifically, the buildPathPermissions function would be best to test. 

The first property could be metamorphic: the order in which the paths are listed within each flag should not effect the permissions. Shuffling the order of the (action, file)s sohuld not change the ruleset.

The second property could be invariant: for any valid input, output should only have allow rules come before the deny rules in order to keep with the last-match-wins logic in OpenCode's evaluate()`

For the generator, I would need to create an array of paths that are joined with file/folder names, and optionally end in * or ** for wider coverage. I would also need a random read vs edit choice.

A naive generator could potentially fall into the trap of creating invalid inputs that contain digits, so the alphabet would need to be restricted to chars that only appear in file paths (letters and certain symbols)
