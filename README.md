# crocodile

Generate's basic function docstrings for Crystal function definitions.

```crystal
def flip(t : Tensor | Enumerable, axis : Int) : Tensor
  ...
end
```

Becomes

```crystal
# Brief description of flip
#
# Arguments
# ---------
# t : Tensor | Enumerable
#   Brief description of t : Tensor | Enumerable
# axis : Int
#   Brief description of axis : Int
#
# Returns
# -------
# Tensor
#
# Examples
# --------
def flip(t : Tensor | Enumerable, axis : Int) : Tensor
  ...
end
```
