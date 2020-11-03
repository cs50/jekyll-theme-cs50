require "time"

def parse(s)
  begin
    Time.strptime(s, "%Y-%m-%d %H:%M:%S")
  rescue
    begin
      Time.strptime(s, "%Y-%m-%d %H:%M")
    rescue
      raise "Invalid datetime: #{s}"
    end
  end
end

s = "2020-09-07 16:15:00"

puts parse(s)
